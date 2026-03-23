const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const tickers = ["AAPL", "TSLA", "BTC-USD"];

let prices = {
    "AAPL": 150,
    "TSLA": 250,
    "BTC-USD": 30000,
};

app.get("/tickers", (req, res) => {
    res.json(tickers);
});

app.get("/history/:ticker", (req, res) => {
    const { ticker } = req.params;

    const history = Array.from({ length: 20 }, () => ({
        time: Date.now(),
        price: prices[ticker] + (Math.random() - 0.5) * 10,
    }));

    res.json(history);
});

wss.on("connection", (ws) => {
    console.log("Client connected");
});

setInterval(() => {
    tickers.forEach((ticker) => {
        prices[ticker] += (Math.random() - 0.5) * 5;

        const data = JSON.stringify({
            ticker,
            price: prices[ticker],
            time: Date.now(),
        });

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
}, 1000);

server.listen(3000, () => {
    console.log("Backend running on http://localhost:3000");
});