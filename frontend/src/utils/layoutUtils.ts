/**
 * utils/layoutUtils.ts — Dashboard grid layout helpers.
 * Provides the default layout, and load/save utilities for localStorage persistence.
 */

import { STORAGE_KEY_LAYOUT } from '../constants';

// ─── Default Grid Layout ──────────────────────────────────────────────────────

export const DEFAULT_LAYOUT = {
  lg: [
    { i: 'markets', x: 0, y: 0, w: 3, h: 8 },
    { i: 'alerts',  x: 0, y: 8, w: 3, h: 6 },
    { i: 'chart',   x: 3, y: 0, w: 9, h: 7 },
    { i: 'stats',   x: 3, y: 7, w: 9, h: 3 },
  ],
};

// ─── Grid Breakpoints & Columns ───────────────────────────────────────────────

export const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
export const GRID_COLS        = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
export const GRID_ROW_HEIGHT  = 60;

// ─── Persistence Helpers ──────────────────────────────────────────────────────

/**
 * Persist a layout object to localStorage.
 * @param layouts - The allLayouts object from react-grid-layout.
 */
export function saveLayout(layouts: object): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAYOUT, JSON.stringify(layouts));
  } catch {
    // Storage may be unavailable (private mode, quota exceeded)
  }
}

/**
 * Load a previously saved layout from localStorage.
 * Returns `null` if nothing is stored or the stored value is invalid JSON.
 */
export function loadLayout(): object | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAYOUT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear the persisted layout from localStorage (used by Escape shortcut).
 */
export function clearLayout(): void {
  localStorage.removeItem(STORAGE_KEY_LAYOUT);
}
