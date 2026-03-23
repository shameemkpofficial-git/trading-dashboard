import { create } from 'zustand';
import type { PriceUpdate, ChartPoint, Alert, AlertEvent } from '../types';

const API = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

interface TradingState {
  tickers: string[];
  selectedTicker: string;
  prices: Record<string, number>;
  history: Record<string, ChartPoint[]>;
  ws: WebSocket | null;

  // ── Alerts ──────────────────────────────────────────────────────────────────
  alerts: Alert[];
  triggeredAlerts: AlertEvent[];

  // Actions
  setTickers: (tickers: string[]) => void;
  setSelectedTicker: (ticker: string) => void;
  updatePrice: (update: PriceUpdate) => void;
  setHistory: (ticker: string, history: ChartPoint[]) => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;

  // Alert actions
  fetchAlerts: () => Promise<void>;
  addAlert: (ticker: string, condition: 'above' | 'below', threshold: number) => Promise<Alert | null>;
  removeAlert: (id: string) => Promise<void>;
  dismissTriggeredAlert: (toastId: string) => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  tickers: [],
  selectedTicker: 'AAPL',
  prices: {},
  history: {},
  ws: null,
  alerts: [],
  triggeredAlerts: [],

  setTickers: (tickers) => set({ tickers }),
  setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),

  updatePrice: (update: PriceUpdate) => {
    set((state) => {
      const newPrices = { ...state.prices, [update.ticker]: update.price };
      const tickerHistory = state.history[update.ticker] || [];
      const newPoint = { time: update.time, price: update.price };
      const updatedHistory = [...tickerHistory, newPoint].slice(-100);
      return {
        prices: newPrices,
        history: { ...state.history, [update.ticker]: updatedHistory },
      };
    });
  },

  setHistory: (ticker, history) =>
    set((state) => ({ history: { ...state.history, [ticker]: history } })),

  // ── Alert actions ──────────────────────────────────────────────────────────

  fetchAlerts: async () => {
    try {
      const res = await fetch(`${API}/alerts`);
      const data: Alert[] = await res.json();
      set({ alerts: data });
    } catch {
      // server may not be ready yet — silently ignore
    }
  },

  addAlert: async (ticker, condition, threshold) => {
    try {
      const res = await fetch(`${API}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, condition, threshold }),
      });
      if (!res.ok) return null;
      const alert: Alert = await res.json();
      set((state) => ({ alerts: [alert, ...state.alerts] }));
      return alert;
    } catch {
      return null;
    }
  },

  removeAlert: async (id) => {
    try {
      await fetch(`${API}/alerts/${id}`, { method: 'DELETE' });
      set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
    } catch {
      // ignore
    }
  },

  dismissTriggeredAlert: (toastId) =>
    set((state) => ({
      triggeredAlerts: state.triggeredAlerts.filter((a) => a.toastId !== toastId),
    })),

  // ── WebSocket ──────────────────────────────────────────────────────────────

  connectWebSocket: () => {
    set((state) => {
      if (state.ws) return state;

      const ws = new WebSocket(WS_URL);

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === 'alert') {
          // A price threshold was crossed — push a toast
          const toastId = `${msg.id}-${Date.now()}`;
          const alertEvent: AlertEvent = { ...msg, toastId };

          useTradingStore.setState((state) => ({
            triggeredAlerts: [...state.triggeredAlerts, alertEvent],
            // Mark the local alert as triggered
            alerts: state.alerts.map((a) =>
              a.id === msg.id ? { ...a, triggered: true } : a
            ),
          }));

          // Auto-dismiss after 6 s
          setTimeout(() => {
            useTradingStore.getState().dismissTriggeredAlert(toastId);
          }, 6000);

        } else if (msg.type === 'subscribed' || msg.type === 'unsubscribed') {
          // ack messages — ignore
        } else {
          // Regular price update
          useTradingStore.getState().updatePrice(msg as PriceUpdate);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        useTradingStore.setState({ ws: null });
      };

      return { ws };
    });
  },

  disconnectWebSocket: () => {
    const state = useTradingStore.getState();
    if (state.ws) {
      state.ws.close();
      set({ ws: null });
    }
  },
}));
