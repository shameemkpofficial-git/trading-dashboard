/**
 * priceUtils.js — Utility functions for price simulation and history seeding.
 */

/**
 * Simulate a single price tick by applying random ±volatility drift.
 *
 * @param {number} currentPrice - The current price of the ticker.
 * @param {number} [volatility=0.001] - Fractional drift magnitude per tick.
 * @returns {number} The new price, rounded to 4 decimal places.
 */
function tickPrice(currentPrice, volatility = 0.001) {
  const change = (Math.random() - 0.5) * currentPrice * volatility;
  return +(currentPrice + change).toFixed(4);
}

/**
 * Generate an initial history array for a single ticker.
 *
 * @param {number} seedPrice - Starting reference price.
 * @param {number} seedCount - Number of historical data points to generate.
 * @param {number} tickIntervalMs - Milliseconds between each simulated tick.
 * @param {number} [volatility=0.005] - Fractional price drift per seed point.
 * @returns {Array<{time: string, price: number}>}
 */
function seedHistory(seedPrice, seedCount, tickIntervalMs, volatility = 0.005) {
  return Array.from({ length: seedCount }, (_, i) => ({
    time: new Date(Date.now() - (seedCount - i) * tickIntervalMs).toISOString(),
    price: +(seedPrice + (Math.random() - 0.5) * seedPrice * volatility).toFixed(4),
  }));
}

module.exports = { tickPrice, seedHistory };
