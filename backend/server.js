const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const tickers = ["AAPL", "TSLA", "BTC-USD", "ETH-USD", "MSFT", "GOOGL"];

let prices = {
    "AAPL": 150,
    "TSLA": 250,
    "BTC-USD": 30000,
    "ETH-USD": 2000,
    "MSFT": 300,
    "GOOGL": 2800,
};

// Store last 50 price points for each ticker
const history = {};
tickers.forEach(ticker => {
    history[ticker] = Array.from({ length: 50 }, (_, i) => ({
        time: new Date(Date.now() - (50 - i) * 1000).toISOString(),
        price: prices[ticker] + (Math.random() - 0.5) * 10,
    }));
});

app.get("/tickers", (req, res) => {
    res.json(tickers);
});

app.get("/history/:ticker", (req, res) => {
    const { ticker } = req.params;
    if (!history[ticker]) {
        return res.status(404).json({ error: "Ticker not found" });
    }
    res.json(history[ticker]);
});

wss.on("connection", (ws) => {
    console.log("Client connected");
});

const updateInterval = setInterval(() => {
    tickers.forEach((ticker) => {
        const change = (Math.random() - 0.5) * (prices[ticker] * 0.001);
        prices[ticker] += change;

        const data = {
            ticker,
            price: prices[ticker],
            time: new Date().toISOString(),
        };

        // Update history
        history[ticker].push({ time: data.time, price: data.price });
        if (history[ticker].length > 100) {
            history[ticker].shift();
        }

        const message = JSON.stringify(data);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
}, 1000);

if (require.main === module) {
    server.listen(3000, () => {
        console.log("Backend running on http://localhost:3000");
    });
}

module.exports = { app, server, history, tickers, updateInterval };