/**
 * constants.js — All static strings, magic numbers, and configuration values
 * for the backend. Import from here instead of hard-coding values inline.
 */

// ─── Market Data ──────────────────────────────────────────────────────────────

const TICKERS = ['AAPL', 'TSLA', 'BTC-USD', 'ETH-USD', 'MSFT', 'GOOGL'];

/** Initial reference prices for each ticker (used for seeding history). */
const INITIAL_PRICES = {
  'AAPL':    150,
  'TSLA':    250,
  'BTC-USD': 30000,
  'ETH-USD': 2000,
  'MSFT':    300,
  'GOOGL':   2800,
};

/** Maximum price data points kept in memory per ticker (rolling window). */
const MAX_HISTORY = 500;

/** Number of data points pre-generated on server startup. */
const HISTORY_SEED = 50;

/** How often (ms) a new price tick is simulated and broadcast. */
const TICK_INTERVAL_MS = 1000;

/** Price drift magnitude per tick (fraction of current price). */
const PRICE_VOLATILITY = 0.001;

/** Seed-time price drift magnitude (slightly larger, for visual variety). */
const SEED_VOLATILITY = 0.005;

// ─── Cache ────────────────────────────────────────────────────────────────────

/** How long (ms) history cache entries remain valid before expiry. */
const CACHE_TTL_MS = 60_000; // 60 s

/** Default limit for /history endpoint when none is supplied. */
const HISTORY_DEFAULT_LIMIT = 100;

// ─── HTTP Headers ─────────────────────────────────────────────────────────────

const HEADER_X_CACHE     = 'X-Cache';
const HEADER_X_CACHE_TTL = 'X-Cache-TTL';
const CACHE_HIT          = 'HIT';
const CACHE_MISS         = 'MISS';

// ─── Auth ─────────────────────────────────────────────────────────────────────

const JWT_SECRET   = process.env.JWT_SECRET || 'trading-dashboard-secret-key';
const TOKEN_EXPIRY = '24h';

// ─── WebSocket Message Types ──────────────────────────────────────────────────

const WS_TYPE_SUBSCRIBE   = 'subscribe';
const WS_TYPE_UNSUBSCRIBE = 'unsubscribe';
const WS_TYPE_SUBSCRIBED  = 'subscribed';
const WS_TYPE_UNSUBSCRIBED = 'unsubscribed';
const WS_TYPE_ALERT       = 'alert';

// ─── Error Messages ───────────────────────────────────────────────────────────

const ERR_USERNAME_PASSWORD_REQUIRED = 'Username and password are required';
const ERR_USERNAME_EXISTS            = 'Username already exists';
const ERR_INVALID_CREDENTIALS        = 'Invalid username or password';
const ERR_NO_TOKEN                   = 'Access denied. No token provided.';
const ERR_INVALID_TOKEN              = 'Invalid or expired token.';
const ERR_ALERT_NOT_FOUND            = 'Alert not found';
const ERR_TICKER_REQUIRED            = 'ticker is required and must be a string';
const ERR_INVALID_CONDITION          = 'condition must be "above" or "below"';
const ERR_INVALID_THRESHOLD          = 'threshold must be a positive number';

// ─── Alert Conditions ─────────────────────────────────────────────────────────

const CONDITION_ABOVE = 'above';
const CONDITION_BELOW = 'below';
const VALID_CONDITIONS = new Set([CONDITION_ABOVE, CONDITION_BELOW]);

// ─── Server ───────────────────────────────────────────────────────────────────

const DEFAULT_PORT = 3000;

module.exports = {
  // Market data
  TICKERS,
  INITIAL_PRICES,
  MAX_HISTORY,
  HISTORY_SEED,
  TICK_INTERVAL_MS,
  PRICE_VOLATILITY,
  SEED_VOLATILITY,
  // Cache
  CACHE_TTL_MS,
  HISTORY_DEFAULT_LIMIT,
  // HTTP headers
  HEADER_X_CACHE,
  HEADER_X_CACHE_TTL,
  CACHE_HIT,
  CACHE_MISS,
  // Auth
  JWT_SECRET,
  TOKEN_EXPIRY,
  // WebSocket
  WS_TYPE_SUBSCRIBE,
  WS_TYPE_UNSUBSCRIBE,
  WS_TYPE_SUBSCRIBED,
  WS_TYPE_UNSUBSCRIBED,
  WS_TYPE_ALERT,
  // Errors
  ERR_USERNAME_PASSWORD_REQUIRED,
  ERR_USERNAME_EXISTS,
  ERR_INVALID_CREDENTIALS,
  ERR_NO_TOKEN,
  ERR_INVALID_TOKEN,
  ERR_ALERT_NOT_FOUND,
  ERR_TICKER_REQUIRED,
  ERR_INVALID_CONDITION,
  ERR_INVALID_THRESHOLD,
  // Alert conditions
  CONDITION_ABOVE,
  CONDITION_BELOW,
  VALID_CONDITIONS,
  // Server
  DEFAULT_PORT,
};
