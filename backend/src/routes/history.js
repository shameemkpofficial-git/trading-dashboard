/**
 * routes/history.js — GET /history/:ticker
 * Returns historical price data for a given ticker, with TTL caching.
 */

const express = require('express');
const auth = require('../auth');
const {
  HEADER_X_CACHE,
  HEADER_X_CACHE_TTL,
  CACHE_HIT,
  CACHE_MISS,
  CACHE_TTL_MS,
  MAX_HISTORY,
  HISTORY_DEFAULT_LIMIT,
} = require('../constants');

const router = express.Router();

/**
 * Factory function that injects shared `history` store and `cache`.
 * @param {{ history: Object, cache: import('../cache') }} deps
 * @returns {express.Router}
 */
module.exports = function createHistoryRouter({ history, cache }) {
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
  router.get('/history/:ticker', auth.authenticateToken, (req, res) => {
    const { ticker } = req.params;

    if (!history[ticker]) {
      return res.status(404).json({ error: `Ticker "${ticker}" not found` });
    }

    // Parse & clamp limit
    const limit = Math.min(
      Math.max(1, parseInt(req.query.limit, 10) || HISTORY_DEFAULT_LIMIT),
      MAX_HISTORY
    );

    // ── Cache lookup ──────────────────────────────────────────────────────────
    const cached = cache.get(ticker);
    if (cached) {
      const slice = cached.slice(-limit);
      res.setHeader(HEADER_X_CACHE, CACHE_HIT);
      res.setHeader(HEADER_X_CACHE_TTL, `${CACHE_TTL_MS / 1000}s`);
      return res.json(slice);
    }

    // ── Cache miss — build from live store ────────────────────────────────────
    const data = history[ticker].slice(); // shallow copy for safe caching
    cache.set(ticker, data);

    const slice = data.slice(-limit);
    res.setHeader(HEADER_X_CACHE, CACHE_MISS);
    res.setHeader(HEADER_X_CACHE_TTL, `${CACHE_TTL_MS / 1000}s`);
    res.json(slice);
  });

  return router;
};
