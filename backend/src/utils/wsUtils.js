/**
 * wsUtils.js — WebSocket broadcast utility functions.
 */

const WebSocket = require('ws');

/**
 * Broadcast a message to all connected WebSocket clients that are subscribed
 * to the given ticker (or have no subscription filter).
 *
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 * @param {string} ticker - The ticker symbol for the message.
 * @param {string} message - The serialized JSON string to send.
 */
function broadcastToSubscribed(wss, ticker, message) {
  wss.clients.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN) return;
    if (client.subscribedTickers && !client.subscribedTickers.has(ticker)) return;
    client.send(message);
  });
}

/**
 * Broadcast a message to ALL connected WebSocket clients regardless of
 * subscription (used for alert notifications).
 *
 * @param {WebSocket.Server} wss - The WebSocket server instance.
 * @param {string} message - The serialized JSON string to send.
 */
function broadcastToAll(wss, message) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = { broadcastToSubscribed, broadcastToAll };
