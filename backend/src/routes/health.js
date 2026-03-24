/**
 * routes/health.js — GET /health
 * Returns server uptime, cache diagnostics, and active alert count.
 */

const express = require('express');
const auth = require('../auth');

const router = express.Router();

/**
 * Factory function that injects `tickers`, `cache`, and `alertsStore`.
 * @param {{ tickers: string[], cache: import('../cache'), alertsStore: import('../alertsStore') }} deps
 * @returns {express.Router}
 */
module.exports = function createHealthRouter({ tickers, cache, alertsStore }) {
  /**
   * GET /health
   * Returns server uptime, cache diagnostics, and active alert count.
   */
  router.get('/health', auth.authenticateToken, (_req, res) => {
    res.json({
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      tickers,
      cache: cache.stats(),
      alerts: { total: alertsStore.size },
    });
  });

  return router;
};
