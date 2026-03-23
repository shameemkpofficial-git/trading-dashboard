/**
 * alertsStore — in-memory CRUD store for price threshold alerts.
 *
 * Alert shape:
 *   {
 *     id: string,          // UUID-style unique id
 *     ticker: string,      // e.g. "AAPL"
 *     condition: "above" | "below",
 *     threshold: number,   // price level
 *     createdAt: string,   // ISO timestamp
 *     triggered: boolean,  // true once fired (won't fire again)
 *   }
 */

const { randomUUID } = require("crypto");

const VALID_CONDITIONS = new Set(["above", "below"]);

class AlertsStore {
    constructor() {
        /** @type {Map<string, Object>} */
        this._alerts = new Map();
    }

    /**
     * Create a new alert.
     * @param {{ ticker: string, condition: string, threshold: number }} params
     * @returns {{ ok: true, alert: Object } | { ok: false, error: string }}
     */
    create({ ticker, condition, threshold }) {
        if (!ticker || typeof ticker !== "string") {
            return { ok: false, error: "ticker is required and must be a string" };
        }
        if (!VALID_CONDITIONS.has(condition)) {
            return { ok: false, error: 'condition must be "above" or "below"' };
        }
        const thresh = Number(threshold);
        if (isNaN(thresh) || thresh <= 0) {
            return { ok: false, error: "threshold must be a positive number" };
        }

        const alert = {
            id: randomUUID(),
            ticker: ticker.toUpperCase(),
            condition,
            threshold: thresh,
            createdAt: new Date().toISOString(),
            triggered: false,
        };

        this._alerts.set(alert.id, alert);
        return { ok: true, alert };
    }

    /**
     * Return all alerts as an array (newest first).
     * @returns {Object[]}
     */
    list() {
        return [...this._alerts.values()].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    /**
     * Delete an alert by id.
     * @param {string} id
     * @returns {boolean} true if deleted, false if not found
     */
    remove(id) {
        return this._alerts.delete(id);
    }

    /**
     * Evaluate all un-triggered alerts for a given ticker against the latest price.
     * Calls `onTriggered(alert, price)` for each alert that fires, then marks it triggered.
     *
     * @param {string} ticker
     * @param {number} price
     * @param {(alert: Object, price: number) => void} onTriggered
     */
    evaluateAll(ticker, price, onTriggered) {
        for (const alert of this._alerts.values()) {
            if (alert.triggered) continue;
            if (alert.ticker !== ticker) continue;

            const crossed =
                (alert.condition === "above" && price >= alert.threshold) ||
                (alert.condition === "below" && price <= alert.threshold);

            if (crossed) {
                alert.triggered = true;
                onTriggered(alert, price);
            }
        }
    }

    /** Clear all alerts (useful in tests). */
    clear() {
        this._alerts.clear();
    }

    /** Total count (for tests / health). */
    get size() {
        return this._alerts.size;
    }
}

module.exports = new AlertsStore();
