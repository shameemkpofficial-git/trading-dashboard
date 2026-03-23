import axios from "axios";

const API_BASE = "http://localhost:3000";

export const getTickers = async () => {
    const res = await axios.get(`${API_BASE}/tickers`);
    return res.data;
};

export const getHistory = async (ticker: string) => {
    const res = await axios.get(`${API_BASE}/history/${ticker}`);
    return res.data;
};