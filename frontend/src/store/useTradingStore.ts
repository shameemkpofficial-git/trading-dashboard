import { create } from 'zustand';
import type { PriceUpdate, ChartPoint } from '../types';

interface TradingState {
  tickers: string[];
  selectedTicker: string;
  prices: Record<string, number>;
  history: Record<string, ChartPoint[]>;
  ws: WebSocket | null;
  
  // Actions
  setTickers: (tickers: string[]) => void;
  setSelectedTicker: (ticker: string) => void;
  updatePrice: (update: PriceUpdate) => void;
  setHistory: (ticker: string, history: ChartPoint[]) => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  tickers: [],
  selectedTicker: 'AAPL',
  prices: {},
  history: {},
  ws: null,

  setTickers: (tickers: string[]) => set({ tickers }),
  
  setSelectedTicker: (ticker: string) => set({ selectedTicker: ticker }),

  updatePrice: (update: PriceUpdate) => {
    set((state: TradingState) => {
      const newPrices = { ...state.prices, [update.ticker]: update.price };
      
      const tickerHistory = state.history[update.ticker] || [];
      const newPoint = { time: update.time, price: update.price };
      const updatedHistory = [...tickerHistory, newPoint].slice(-100);
      
      return {
        prices: newPrices,
        history: {
          ...state.history,
          [update.ticker]: updatedHistory
        }
      };
    });
  },

  setHistory: (ticker: string, history: ChartPoint[]) => set((state: TradingState) => ({
    history: { ...state.history, [ticker]: history }
  })),

  connectWebSocket: () => {
    set((state: TradingState) => {
      if (state.ws) return state;

      const ws = new WebSocket('ws://localhost:3000');

      ws.onmessage = (event) => {
        const update: PriceUpdate = JSON.parse(event.data);
        useTradingStore.getState().updatePrice(update);
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
  }
}));

