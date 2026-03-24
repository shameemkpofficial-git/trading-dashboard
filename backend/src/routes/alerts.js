/**
 * routes/alerts.js — Price alert CRUD routes:
 *   POST   /alerts
 *   GET    /alerts
 *   DELETE /alerts/:id
 */

const express = require('express');
const auth = require('../auth');
const { ERR_ALERT_NOT_FOUND } = require('../constants');

const router = express.Router();

/**
 * Factory function that injects shared `tickers` list and `alertsStore`.
 * @param {{ tickers: string[], alertsStore: import('../alertsStore') }} deps
 * @returns {express.Router}
 */
module.exports = function createAlertsRouter({ tickers, alertsStore }) {
  /**
   * POST /alerts
   * Create a price threshold alert.
   * Body: { ticker, condition: "above"|"below", threshold }
   */
  router.post('/alerts', auth.authenticateToken, (req, res) => {
    const { ticker, condition, threshold } = req.body || {};

    if (!tickers.includes((ticker || '').toUpperCase())) {
      return res
        .status(400)
        .json({ error: `Unknown ticker "${ticker}". Valid: ${tickers.join(', ')}` });
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
  router.get('/alerts', auth.authenticateToken, (_req, res) => {
    res.json(alertsStore.list());
  });

  /**
   * DELETE /alerts/:id
   * Remove an alert by id.
   */
  router.delete('/alerts/:id', auth.authenticateToken, (req, res) => {
    const deleted = alertsStore.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: ERR_ALERT_NOT_FOUND });
    }
    res.status(204).end();
  });

  return router;
};
