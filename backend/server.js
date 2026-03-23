const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const HistoryCache = require("./src/cache");
const alertsStore = require("./src/alertsStore");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ─── Constants ────────────────────────────────────────────────────────────────

const tickers = ["AAPL", "TSLA", "BTC-USD", "ETH-USD", "MSFT", "GOOGL"];
const MAX_HISTORY = 500; // max data points kept in memory per ticker
const HISTORY_SEED = 50;  // data points pre-generated on startup
const TICK_INTERVAL_MS = 1000;
const CACHE_TTL_MS = 60_000; // 60 s

// ─── Initial Prices ───────────────────────────────────────────────────────────

let prices = {
    "AAPL":    150,
    "TSLA":    250,
    "BTC-USD": 30000,
    "ETH-USD": 2000,
    "MSFT":    300,
    "GOOGL":   2800,
};

// ─── Live History Store ───────────────────────────────────────────────────────
// Rolling window of up to MAX_HISTORY price points per ticker.

/** @type {Object.<string, Array<{time: string, price: number}>>} */
const history = {};
tickers.forEach((ticker) => {
    history[ticker] = Array.from({ length: HISTORY_SEED }, (_, i) => ({
        time: new Date(Date.now() - (HISTORY_SEED - i) * TICK_INTERVAL_MS).toISOString(),
        price: +(prices[ticker] + (Math.random() - 0.5) * prices[ticker] * 0.005).toFixed(4),
    }));
});

// ─── Cache ────────────────────────────────────────────────────────────────────

const cache = new HistoryCache(CACHE_TTL_MS);

// ─── REST API ─────────────────────────────────────────────────────────────────

/**
 * GET /tickers
 * Returns the list of all available ticker symbols.
 */
app.get("/tickers", (req, res) => {
    res.json(tickers);
});

/**
 * GET /history/:ticker[?limit=N]
 * Returns historical price data for a given ticker.
 *
 * Cache behaviour:
 *  - Cache TTL: 60 s
 *  - X-Cache: HIT  → served from cache
 *  - X-Cache: MISS → built from live history store, then cached
 *
 * Query params:
 *  - limit (number, 1–500, default 100): number of most-recent data points to return
 */
app.get("/history/:ticker", (req, res) => {
    const { ticker } = req.params;

    if (!history[ticker]) {
        return res.status(404).json({ error: `Ticker "${ticker}" not found` });
    }

    // Parse & clamp limit
    const limit = Math.min(
        Math.max(1, parseInt(req.query.limit, 10) || 100),
        MAX_HISTORY
    );

    // ── Cache lookup ──────────────────────────────────────────────────────────
    const cached = cache.get(ticker);
    if (cached) {
        const slice = cached.slice(-limit);
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-TTL", `${CACHE_TTL_MS / 1000}s`);
        return res.json(slice);
    }

    // ── Cache miss — build from live store ────────────────────────────────────
    const data = history[ticker].slice(); // shallow copy for safe caching
    cache.set(ticker, data);

    const slice = data.slice(-limit);
    res.setHeader("X-Cache", "MISS");
    res.setHeader("X-Cache-TTL", `${CACHE_TTL_MS / 1000}s`);
    res.json(slice);
});

// ─── Alerts REST API ──────────────────────────────────────────────────────────

/**
 * POST /alerts
 * Create a price threshold alert.
 * Body: { ticker, condition: "above"|"below", threshold }
 */
app.post("/alerts", (req, res) => {
    const { ticker, condition, threshold } = req.body || {};

    if (!tickers.includes((ticker || "").toUpperCase())) {
        return res.status(400).json({ error: `Unknown ticker "${ticker}". Valid: ${tickers.join(", ")}` });
    }

    const result = alertsStore.create({ ticker, condition, threshold });
    if (!result.ok) {
        return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result.alert);
});

/**
 * GET /alerts
 * List all active (and triggered) alerts.
 */
app.get("/alerts", (req, res) => {
    res.json(alertsStore.list());
});

/**
 * DELETE /alerts/:id
 * Remove an alert by id.
 */
app.delete("/alerts/:id", (req, res) => {
    const deleted = alertsStore.remove(req.params.id);
    if (!deleted) {
        return res.status(404).json({ error: "Alert not found" });
    }
    res.status(204).end();
});

/**
 * GET /health
 * Returns server uptime, cache diagnostics, and active alert count.
 */
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptimeSeconds: Math.floor(process.uptime()),
        tickers,
        cache: cache.stats(),
        alerts: { total: alertsStore.size },
    });
});

// ─── WebSocket ────────────────────────────────────────────────────────────────
// Clients may send a subscribe message to filter updates by ticker:
//   { "type": "subscribe", "tickers": ["AAPL", "TSLA"] }
// Without a subscribe message all ticker updates are broadcast (backward-compat).

wss.on("connection", (ws) => {
    console.log("[WS] Client connected");

    /** @type {Set<string>|null} null = subscribe to everything */
    ws.subscribedTickers = null;

    ws.on("message", (raw) => {
        try {
            const msg = JSON.parse(raw.toString());

            if (msg.type === "subscribe" && Array.isArray(msg.tickers)) {
                // Validate requested tickers
                const valid = msg.tickers.filter((t) => tickers.includes(t));
                ws.subscribedTickers = new Set(valid);
                ws.send(JSON.stringify({
                    type: "subscribed",
                    tickers: valid,
                    timestamp: new Date().toISOString(),
                }));
                console.log(`[WS] Client subscribed to: ${valid.join(", ")}`);
            }

            if (msg.type === "unsubscribe") {
                ws.subscribedTickers = null;
                ws.send(JSON.stringify({ type: "unsubscribed", timestamp: new Date().toISOString() }));
            }
        } catch {
            // Ignore non-JSON messages
        }
    });

    ws.on("close", () => console.log("[WS] Client disconnected"));
    ws.on("error", (err) => console.error("[WS] Error:", err.message));
});

// ─── Market Data Feed (mock) ──────────────────────────────────────────────────

const updateInterval = setInterval(() => {
    tickers.forEach((ticker) => {
        // Simulate realistic price drift (±0.05 % per tick)
        const change = (Math.random() - 0.5) * prices[ticker] * 0.001;
        prices[ticker] = +(prices[ticker] + change).toFixed(4);

        const point = {
            time: new Date().toISOString(),
            price: prices[ticker],
        };

        // Append to live history, evict oldest if over cap
        history[ticker].push(point);
        if (history[ticker].length > MAX_HISTORY) {
            history[ticker].shift();
        }

        // Invalidate cache so next /history request gets fresh data
        cache.invalidate(ticker);

        // ── Evaluate price alerts ─────────────────────────────────────────────
        alertsStore.evaluateAll(ticker, prices[ticker], (alert, triggeredPrice) => {
            const alertMsg = JSON.stringify({
                type: "alert",
                id: alert.id,
                ticker: alert.ticker,
                condition: alert.condition,
                threshold: alert.threshold,
                price: triggeredPrice,
                time: new Date().toISOString(),
            });
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(alertMsg);
                }
            });
            console.log(`[ALERT] ${alert.ticker} ${alert.condition} ${alert.threshold} → price=${triggeredPrice}`);
        });

        const message = JSON.stringify({ ticker, ...point });

        // Broadcast to subscribed WebSocket clients
        wss.clients.forEach((client) => {
            if (client.readyState !== WebSocket.OPEN) return;
            // If the client has a subscription filter, check it
            if (client.subscribedTickers && !client.subscribedTickers.has(ticker)) return;
            client.send(message);
        });
    });
}, TICK_INTERVAL_MS);

// ─── Boot ─────────────────────────────────────────────────────────────────────

if (require.main === module) {
    server.listen(3000, () => {
        console.log("Backend running on http://localhost:3000");
        console.log(`Tickers: ${tickers.join(", ")}`);
        console.log(`Cache TTL: ${CACHE_TTL_MS / 1000}s | Max history points: ${MAX_HISTORY}`);
    });
}

module.exports = { app, server, history, tickers, updateInterval, cache, alertsStore };