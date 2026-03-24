import { API_BASE } from '../constants';

export const getTickers = async (token: string): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/tickers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const getHistory = async (ticker: string, token: string): Promise<any[]> => {
  const res = await fetch(`${API_BASE}/history/${ticker}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};