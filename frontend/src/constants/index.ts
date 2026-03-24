/**
 * constants/index.ts — App-wide configuration constants.
 * API endpoints, WebSocket URL, localStorage keys, and magic numbers.
 */

const isDev = import.meta.env.DEV;

// ─── API & WebSocket ──────────────────────────────────────────────────────────

export const API_BASE = isDev ? 'http://localhost:3000' : '/api';
export const WS_URL   = isDev
  ? 'ws://localhost:3000'
  : `ws://${window.location.host}/ws`;

// ─── localStorage Keys ────────────────────────────────────────────────────────

export const STORAGE_KEY_TOKEN  = 'trading_token';
export const STORAGE_KEY_USER   = 'trading_user';
export const STORAGE_KEY_LAYOUT = 'dashboard-layout';

// ─── Timing ───────────────────────────────────────────────────────────────────

/** Duration (ms) before a toast alert auto-dismisses. */
export const TOAST_DURATION_MS = 6000;

/** Duration (ms) price flash colour stays visible on a ticker row. */
export const PRICE_FLASH_MS = 500;

/** Maximum number of chart data points kept in local state. */
export const MAX_CHART_POINTS = 100;

// ─── WebSocket Message Types ──────────────────────────────────────────────────

export const WS_TYPE_ALERT       = 'alert';
export const WS_TYPE_SUBSCRIBED  = 'subscribed';
export const WS_TYPE_UNSUBSCRIBED = 'unsubscribed';

// ─── Chart Style ─────────────────────────────────────────────────────────────

export const CHART_LINE_COLOR    = '#00d382';
export const CHART_GRID_STROKE   = '#272a3b';
export const CHART_AXIS_STROKE   = '#8c93a8';
export const CHART_TOOLTIP_BG    = '#14161f';
export const CHART_TOOLTIP_BORDER = '#272a3b';
export const CHART_TOOLTIP_COLOR = '#f0f2f7';
