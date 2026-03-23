const test = require("node:test");
const assert = require("node:assert");
const { history, tickers, updateInterval } = require("./server");

// Simple logic tests
test("Tickers list is correct", () => {
    assert.deepStrictEqual(tickers, ["AAPL", "TSLA", "BTC-USD", "ETH-USD", "MSFT", "GOOGL"]);
});

test("History is initialized for all tickers", () => {
    tickers.forEach(ticker => {
        assert.ok(history[ticker]);
        assert.strictEqual(history[ticker].length, 50);
    });
});

// Clean up interval after tests
test.after(() => {
    clearInterval(updateInterval);
});
