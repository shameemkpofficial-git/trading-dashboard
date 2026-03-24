/**
 * routes/tickers.js — GET /tickers
 * Returns the list of all available ticker symbols.
 */

const express = require('express');
const auth = require('../auth');

const router = express.Router();

/**
 * Factory function that injects the shared `tickers` array.
 * @param {{ tickers: string[] }} deps
 * @returns {express.Router}
 */
module.exports = function createTickersRouter({ tickers }) {
  /**
   * GET /tickers
   * Returns the list of all available ticker symbols.
   */
  router.get('/tickers', auth.authenticateToken, (_req, res) => {
    res.json(tickers);
  });

  return router;
};
