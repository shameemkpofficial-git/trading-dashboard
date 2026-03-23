/**
 * HistoryCache — in-memory TTL cache for historical price data.
 *
 * Design:
 *  - Each ticker's history is stored with a timestamp.
 *  - Entries older than `ttlMs` are considered stale and will be re-fetched.
 *  - `invalidate(ticker)` is called whenever new live price data arrives,
 *    ensuring the next /history request rebuilds from the latest live data.
 */

class HistoryCache {
    /**
     * @param {number} ttlMs - Time-to-live in milliseconds (default 60 000 ms)
     */
    constructor(ttlMs = 60_000) {
        this.ttlMs = ttlMs;
        /** @type {Map<string, { data: Array, cachedAt: number }>} */
        this._store = new Map();
        this._hits = 0;
        this._misses = 0;
    }

    /**
     * Retrieve cached history for a ticker.
     * Returns `null` on cache miss or if the entry is stale.
     * @param {string} ticker
     * @returns {Array|null}
     */
    get(ticker) {
        const entry = this._store.get(ticker);
        if (!entry) {
            this._misses++;
            return null;
        }
        if (Date.now() - entry.cachedAt > this.ttlMs) {
            // TTL expired — evict and report miss
            this._store.delete(ticker);
            this._misses++;
            return null;
        }
        this._hits++;
        return entry.data;
    }

    /**
     * Store (or replace) cached history for a ticker.
     * @param {string} ticker
     * @param {Array} data
     */
    set(ticker, data) {
        this._store.set(ticker, { data, cachedAt: Date.now() });
    }

    /**
     * Invalidate a ticker's cache entry (called on new price data).
     * @param {string} ticker
     */
    invalidate(ticker) {
        this._store.delete(ticker);
    }

    /** Invalidate all entries. */
    clear() {
        this._store.clear();
    }

    /**
     * Returns an array of currently cached ticker keys.
     * @returns {string[]}
     */
    cachedTickers() {
        return [...this._store.keys()];
    }

    /** Diagnostic stats for the /health endpoint. */
    stats() {
        return {
            hits: this._hits,
            misses: this._misses,
            hitRate: this._hits + this._misses === 0
                ? 0
                : +(this._hits / (this._hits + this._misses)).toFixed(4),
            cachedTickers: this.cachedTickers(),
            ttlMs: this.ttlMs,
        };
    }
}

module.exports = HistoryCache;
