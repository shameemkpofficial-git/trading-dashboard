const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const logger = require('./src/utils/logger');

const HistoryCache = require('./src/cache');
const alertsStore = require('./src/alertsStore');
const auth = require('./src/auth');

const {
  TICKERS,
  INITIAL_PRICES,
  MAX_HISTORY,
  HISTORY_SEED,
  TICK_INTERVAL_MS,
  PRICE_VOLATILITY,
  SEED_VOLATILITY,
  CACHE_TTL_MS,
  WS_TYPE_SUBSCRIBE,
  WS_TYPE_UNSUBSCRIBE,
  WS_TYPE_SUBSCRIBED,
  WS_TYPE_UNSUBSCRIBED,
  WS_TYPE_ALERT,
  DEFAULT_PORT,
} = require('./src/constants');

const { tickPrice, seedHistory } = require('./src/utils/priceUtils');
const { broadcastToSubscribed, broadcastToAll } = require('./src/utils/wsUtils');

// ─── Route factories ──────────────────────────────────────────────────────────

const authRoutes    = require('./src/routes/auth');
const createTickers = require('./src/routes/tickers');
const createHistory = require('./src/routes/history');
const createAlerts  = require('./src/routes/alerts');
const createHealth  = require('./src/routes/health');

// ─── Live Data Stores ─────────────────────────────────────────────────────────

/** @type {Record<string, number>} - Current live price per ticker. */
const prices = { ...INITIAL_PRICES };

/** @type {Record<string, Array<{time: string, price: number}>>} - Rolling history. */
const history = {};
const tickers = TICKERS;

tickers.forEach((ticker) => {
  history[ticker] = seedHistory(prices[ticker], HISTORY_SEED, TICK_INTERVAL_MS, SEED_VOLATILITY);
});

const cache = new HistoryCache(CACHE_TTL_MS);

// ─── Express App ──────────────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ─── Mount Routes ─────────────────────────────────────────────────────────────

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(authRoutes);
app.use(createTickers({ tickers }));
app.use(createHistory({ history, cache }));
app.use(createAlerts({ tickers, alertsStore }));
app.use(createHealth({ tickers, cache, alertsStore }));

app.use((err, req, res, next) => {
  logger.error({ err, req: { method: req.method, url: req.url } }, 'Unhandled API Error');
  
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// ─── WebSocket ────────────────────────────────────────────────────────────────
// Clients may send a subscribe message to filter updates by ticker:
//   { "type": "subscribe", "tickers": ["AAPL", "TSLA"] }
// Without a subscribe message all ticker updates are broadcast (backward-compat).

wss.on('connection', (ws) => {
  logger.info({ event: 'ws_connected' }, 'Client connected');

  /** @type {Set<string>|null} null = subscribe to everything */
  ws.subscribedTickers = null;

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === WS_TYPE_SUBSCRIBE && Array.isArray(msg.tickers)) {
        const valid = msg.tickers.filter((t) => tickers.includes(t));
        ws.subscribedTickers = new Set(valid);
        ws.send(JSON.stringify({
          type: WS_TYPE_SUBSCRIBED,
          tickers: valid,
          timestamp: new Date().toISOString(),
        }));
        logger.info({ event: 'ws_subscribed', tickers: valid }, 'Client subscribed');
      }

      if (msg.type === WS_TYPE_UNSUBSCRIBE) {
        ws.subscribedTickers = null;
        ws.send(JSON.stringify({ type: WS_TYPE_UNSUBSCRIBED, timestamp: new Date().toISOString() }));
      }
    } catch {
      // Ignore non-JSON messages
    }
  });

  ws.on('close', () => logger.info({ event: 'ws_disconnected' }, 'Client disconnected'));
  ws.on('error', (err) => logger.error({ event: 'ws_error', error: err.message }, 'WebSocket Error'));
});

// ─── Market Data Feed (mock) ──────────────────────────────────────────────────

const updateInterval = setInterval(() => {
  tickers.forEach((ticker) => {
    prices[ticker] = tickPrice(prices[ticker], PRICE_VOLATILITY);

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

    // ── Evaluate price alerts ─────────────────────────────────────────────────
    alertsStore.evaluateAll(ticker, prices[ticker], (alert, triggeredPrice) => {
      const alertMsg = JSON.stringify({
        type: WS_TYPE_ALERT,
        id: alert.id,
        ticker: alert.ticker,
        condition: alert.condition,
        threshold: alert.threshold,
        price: triggeredPrice,
        time: new Date().toISOString(),
      });
      broadcastToAll(wss, alertMsg);
      logger.info({ event: 'alert_triggered', ticker: alert.ticker, condition: alert.condition, threshold: alert.threshold, price: triggeredPrice }, 'Price threshold triggered');
    });

    const message = JSON.stringify({ ticker, ...point });
    broadcastToSubscribed(wss, ticker, message);
  });
}, TICK_INTERVAL_MS);

// ─── Boot ─────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const PORT = process.env.PORT || DEFAULT_PORT;
  server.listen(PORT, () => {
    logger.info({ port: PORT }, `Backend running on port ${PORT}`);
    logger.info({ tickers }, `Tickers loaded`);
    logger.info({ ttl: CACHE_TTL_MS / 1000, maxHistory: MAX_HISTORY }, `Cache configured`);
  });
}

module.exports = { app, server, history, tickers, updateInterval, cache, alertsStore };