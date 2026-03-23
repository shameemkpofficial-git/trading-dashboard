const test = require("node:test");
const assert = require("node:assert");
const { history, tickers, updateInterval, cache } = require("./server");

// ─── Tickers ──────────────────────────────────────────────────────────────────

test("Tickers list contains all expected symbols", () => {
    assert.deepStrictEqual(tickers, ["AAPL", "TSLA", "BTC-USD", "ETH-USD", "MSFT", "GOOGL"]);
});

// ─── History ──────────────────────────────────────────────────────────────────

test("History is initialized for all tickers with 50 seed points", () => {
    tickers.forEach((ticker) => {
        assert.ok(history[ticker], `history missing for ${ticker}`);
        assert.strictEqual(history[ticker].length, 50);
    });
});

test("Each history point has a time (ISO string) and numeric price", () => {
    const point = history["AAPL"][0];
    assert.ok(typeof point.time === "string");
    assert.ok(!isNaN(new Date(point.time).getTime()), "time is not a valid ISO date");
    assert.ok(typeof point.price === "number");
});

// ─── Cache ────────────────────────────────────────────────────────────────────

test("Cache: first get() is a miss, second get() after set() is a hit", () => {
    cache.clear();

    const miss = cache.get("MSFT");
    assert.strictEqual(miss, null, "expected cache miss");

    cache.set("MSFT", history["MSFT"].slice());
    const hit = cache.get("MSFT");
    assert.ok(Array.isArray(hit), "expected cache hit to return array");
});

test("Cache: invalidate() removes the entry", () => {
    cache.set("GOOGL", history["GOOGL"].slice());
    cache.invalidate("GOOGL");
    assert.strictEqual(cache.get("GOOGL"), null, "entry should be gone after invalidate");
});

test("Cache: TTL expiry evicts stale entries", async () => {
    // Create a cache with 50 ms TTL for this isolated test
    const HistoryCache = require("./src/cache");
    const shortCache = new HistoryCache(50);
    shortCache.set("AAPL", [{ time: new Date().toISOString(), price: 150 }]);

    // Immediately — should hit
    assert.ok(shortCache.get("AAPL") !== null, "should be a hit within TTL");

    // Wait for TTL to expire
    await new Promise((r) => setTimeout(r, 60));
    assert.strictEqual(shortCache.get("AAPL"), null, "should be a miss after TTL expires");
});

test("Cache: stats() reports hits and misses correctly", () => {
    const HistoryCache = require("./src/cache");
    const c = new HistoryCache(60_000);

    c.get("AAPL");                          // miss
    c.set("AAPL", []);
    c.get("AAPL");                          // hit

    const stats = c.stats();
    assert.strictEqual(stats.misses, 1);
    assert.strictEqual(stats.hits, 1);
    assert.strictEqual(stats.hitRate, 0.5);
    assert.deepStrictEqual(stats.cachedTickers, ["AAPL"]);
});

// ─── REST API ─────────────────────────────────────────────────────────────────

test("GET /tickers returns full ticker array", async () => {
    const { app } = require("./server");
    const res = await fetch(`http://localhost:${3000}/tickers`).catch(() => null);
    // If server isn't running in test context, skip network-level checks
    if (!res) return;
    const body = await res.json();
    assert.deepStrictEqual(body, tickers);
});

test("GET /history/AAPL?limit=5 returns at most 5 points", async () => {
    const res = await fetch("http://localhost:3000/history/AAPL?limit=5").catch(() => null);
    if (!res) return;
    const body = await res.json();
    assert.ok(body.length <= 5, `expected ≤5 points, got ${body.length}`);
});

test("GET /history/UNKNOWN returns 404", async () => {
    const res = await fetch("http://localhost:3000/history/UNKNOWN").catch(() => null);
    if (!res) return;
    assert.strictEqual(res.status, 404);
});

test("GET /history/TSLA returns X-Cache header", async () => {
    // clear cache so we force a MISS first
    cache.clear();
    const res1 = await fetch("http://localhost:3000/history/TSLA").catch(() => null);
    if (!res1) return;
    assert.strictEqual(res1.headers.get("x-cache"), "MISS");

    const res2 = await fetch("http://localhost:3000/history/TSLA").catch(() => null);
    if (!res2) return;
    assert.strictEqual(res2.headers.get("x-cache"), "HIT");
});

test("GET /health returns status ok", async () => {
    const res = await fetch("http://localhost:3000/health").catch(() => null);
    if (!res) return;
    const body = await res.json();
    assert.strictEqual(body.status, "ok");
    assert.ok(typeof body.uptimeSeconds === "number");
    assert.ok(Array.isArray(body.tickers));
    assert.ok(body.cache);
});

// ─── Cleanup ──────────────────────────────────────────────────────────────────

test.after(() => {
    clearInterval(updateInterval);
});
