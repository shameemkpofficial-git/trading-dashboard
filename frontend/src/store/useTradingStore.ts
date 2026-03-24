import { create } from 'zustand';
import type { PriceUpdate, ChartPoint, Alert, AlertEvent } from '../types';

const isDev = import.meta.env.DEV;
const API = isDev ? 'http://localhost:3000' : '/api';
const WS_URL = isDev ? 'ws://localhost:3000' : `ws://${window.location.host}/ws`;

interface TradingState {
  tickers: string[];
  selectedTicker: string;
  prices: Record<string, number>;
  history: Record<string, ChartPoint[]>;
  ws: WebSocket | null;

  // ── Alerts ──────────────────────────────────────────────────────────────────
  alerts: Alert[];
  triggeredAlerts: AlertEvent[];
  user: { username: string } | null;
  token: string | null;

  // Actions
  setTickers: (tickers: string[]) => void;
  setSelectedTicker: (ticker: string) => void;
  updatePrice: (update: PriceUpdate) => void;
  setHistory: (ticker: string, history: ChartPoint[]) => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;

  // Auth actions
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  bootstrapAuth: () => void;

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
  user: null,
  token: null,

  setTickers: (tickers) => set({ tickers }),
  setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),

  login: async (username, password) => {
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };
      localStorage.setItem('trading_token', data.token);
      localStorage.setItem('trading_user', JSON.stringify(data.user));
      set({ token: data.token, user: data.user });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Server connection failed' };
    }
  },

  register: async (username, password) => {
    try {
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Server connection failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('trading_token');
    localStorage.removeItem('trading_user');
    set({ token: null, user: null, alerts: [], triggeredAlerts: [] });
  },

  bootstrapAuth: () => {
    const token = localStorage.getItem('trading_token');
    const userStr = localStorage.getItem('trading_user');
    if (token && userStr) {
      try {
        set({ token, user: JSON.parse(userStr) });
      } catch {
        localStorage.removeItem('trading_token');
        localStorage.removeItem('trading_user');
      }
    }
  },

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
    const { token } = useTradingStore.getState();
    if (!token) return;
    try {
      const res = await fetch(`${API}/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data: Alert[] = await res.json();
      set({ alerts: data });
    } catch {
      // ignore
    }
  },

  addAlert: async (ticker, condition, threshold) => {
    const { token } = useTradingStore.getState();
    if (!token) return null;
    try {
      const res = await fetch(`${API}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
    const { token } = useTradingStore.getState();
    if (!token) return;
    try {
      await fetch(`${API}/alerts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
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
