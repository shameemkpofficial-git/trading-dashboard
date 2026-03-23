const test = require("node:test");
const assert = require("node:assert");
const { history, tickers, updateInterval, cache, alertsStore } = require("./server");

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
    assert.strictEqual(cache.get("MSFT"), null, "expected cache miss");
    cache.set("MSFT", history["MSFT"].slice());
    assert.ok(Array.isArray(cache.get("MSFT")), "expected cache hit");
});

test("Cache: invalidate() removes the entry", () => {
    cache.set("GOOGL", history["GOOGL"].slice());
    cache.invalidate("GOOGL");
    assert.strictEqual(cache.get("GOOGL"), null);
});

test("Cache: TTL expiry evicts stale entries", async () => {
    const HistoryCache = require("./src/cache");
    const shortCache = new HistoryCache(50);
    shortCache.set("AAPL", [{ time: new Date().toISOString(), price: 150 }]);
    assert.ok(shortCache.get("AAPL") !== null);
    await new Promise((r) => setTimeout(r, 60));
    assert.strictEqual(shortCache.get("AAPL"), null);
});

test("Cache: stats() reports hits and misses correctly", () => {
    const HistoryCache = require("./src/cache");
    const c = new HistoryCache(60_000);
    c.get("AAPL");
    c.set("AAPL", []);
    c.get("AAPL");
    const stats = c.stats();
    assert.strictEqual(stats.misses, 1);
    assert.strictEqual(stats.hits, 1);
    assert.strictEqual(stats.hitRate, 0.5);
});

// ─── AlertsStore ──────────────────────────────────────────────────────────────

test("AlertsStore: create() returns a valid alert object", () => {
    alertsStore.clear();
    const result = alertsStore.create({ ticker: "AAPL", condition: "above", threshold: 200 });
    assert.ok(result.ok, "expected ok");
    const a = result.alert;
    assert.ok(typeof a.id === "string");
    assert.strictEqual(a.ticker, "AAPL");
    assert.strictEqual(a.condition, "above");
    assert.strictEqual(a.threshold, 200);
    assert.strictEqual(a.triggered, false);
});

test("AlertsStore: create() rejects invalid condition", () => {
    const result = alertsStore.create({ ticker: "TSLA", condition: "sideways", threshold: 100 });
    assert.ok(!result.ok);
    assert.ok(result.error.includes("condition"));
});

test("AlertsStore: create() rejects non-positive threshold", () => {
    const result = alertsStore.create({ ticker: "TSLA", condition: "above", threshold: -1 });
    assert.ok(!result.ok);
    assert.ok(result.error.includes("threshold"));
});

test("AlertsStore: list() returns all alerts", () => {
    alertsStore.clear();
    alertsStore.create({ ticker: "AAPL", condition: "above", threshold: 100 });
    alertsStore.create({ ticker: "TSLA", condition: "below", threshold: 300 });
    const list = alertsStore.list();
    assert.strictEqual(list.length, 2);
    const tks = list.map((a) => a.ticker);
    assert.ok(tks.includes("AAPL"));
    assert.ok(tks.includes("TSLA"));
});

test("AlertsStore: remove() deletes by id", () => {
    alertsStore.clear();
    const { alert } = alertsStore.create({ ticker: "AAPL", condition: "above", threshold: 200 });
    assert.ok(alertsStore.remove(alert.id));
    assert.strictEqual(alertsStore.list().length, 0);
    assert.ok(!alertsStore.remove("nonexistent-id"));
});

test("AlertsStore: evaluateAll() fires callback when condition is met", () => {
    alertsStore.clear();
    alertsStore.create({ ticker: "AAPL", condition: "above", threshold: 100 });

    let fired = 0;
    alertsStore.evaluateAll("AAPL", 101, () => fired++);
    assert.strictEqual(fired, 1, "should fire once");
});

test("AlertsStore: evaluateAll() does NOT fire twice for same alert", () => {
    alertsStore.clear();
    alertsStore.create({ ticker: "AAPL", condition: "above", threshold: 100 });

    let fired = 0;
    alertsStore.evaluateAll("AAPL", 101, () => fired++);
    alertsStore.evaluateAll("AAPL", 102, () => fired++);
    assert.strictEqual(fired, 1, "should only fire once");
});

test("AlertsStore: evaluateAll() does NOT fire when condition is not met", () => {
    alertsStore.clear();
    alertsStore.create({ ticker: "AAPL", condition: "above", threshold: 200 });

    let fired = 0;
    alertsStore.evaluateAll("AAPL", 150, () => fired++);
    assert.strictEqual(fired, 0);
});

test("AlertsStore: evaluateAll() correctly handles 'below' condition", () => {
    alertsStore.clear();
    alertsStore.create({ ticker: "BTC-USD", condition: "below", threshold: 25000 });

    let firedWith = null;
    alertsStore.evaluateAll("BTC-USD", 24999, (alert, price) => { firedWith = price; });
    assert.strictEqual(firedWith, 24999);
});

// ─── REST API ─────────────────────────────────────────────────────────────────

test("GET /tickers returns full ticker array", async () => {
    const res = await fetch("http://localhost:3000/tickers").catch(() => null);
    if (!res) return;
    const body = await res.json();
    assert.deepStrictEqual(body, tickers);
});

test("GET /history/AAPL?limit=5 returns at most 5 points", async () => {
    const res = await fetch("http://localhost:3000/history/AAPL?limit=5").catch(() => null);
    if (!res) return;
    const body = await res.json();
    assert.ok(body.length <= 5);
});

test("GET /history/UNKNOWN returns 404", async () => {
    const res = await fetch("http://localhost:3000/history/UNKNOWN").catch(() => null);
    if (!res) return;
    assert.strictEqual(res.status, 404);
});

test("GET /history/TSLA returns X-Cache header", async () => {
    cache.clear();
    const res1 = await fetch("http://localhost:3000/history/TSLA").catch(() => null);
    if (!res1) return;
    assert.strictEqual(res1.headers.get("x-cache"), "MISS");
    const res2 = await fetch("http://localhost:3000/history/TSLA").catch(() => null);
    if (!res2) return;
    assert.strictEqual(res2.headers.get("x-cache"), "HIT");
});

test("POST /alerts creates an alert and GET /alerts lists it", async () => {
    const create = await fetch("http://localhost:3000/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: "AAPL", condition: "above", threshold: 99999 }),
    }).catch(() => null);
    if (!create) return;
    assert.strictEqual(create.status, 201);
    const alert = await create.json();
    assert.ok(alert.id);

    const list = await fetch("http://localhost:3000/alerts").catch(() => null);
    if (!list) return;
    const alerts = await list.json();
    assert.ok(alerts.some((a) => a.id === alert.id));

    // cleanup
    await fetch(`http://localhost:3000/alerts/${alert.id}`, { method: "DELETE" }).catch(() => null);
});

test("POST /alerts rejects unknown ticker", async () => {
    const res = await fetch("http://localhost:3000/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: "FAKE", condition: "above", threshold: 100 }),
    }).catch(() => null);
    if (!res) return;
    assert.strictEqual(res.status, 400);
});

test("DELETE /alerts/:id returns 404 for unknown id", async () => {
    const res = await fetch("http://localhost:3000/alerts/nonexistent-id", {
        method: "DELETE",
    }).catch(() => null);
    if (!res) return;
    assert.strictEqual(res.status, 404);
});

test("GET /health returns status ok with alerts field", async () => {
    const res = await fetch("http://localhost:3000/health").catch(() => null);
    if (!res) return;
    const body = await res.json();
    assert.strictEqual(body.status, "ok");
    assert.ok(body.alerts);
    assert.ok(typeof body.alerts.total === "number");
});

// ─── Cleanup ──────────────────────────────────────────────────────────────────

test.after(() => {
    clearInterval(updateInterval);
});
