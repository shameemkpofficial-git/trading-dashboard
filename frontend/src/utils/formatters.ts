/**
 * utils/formatters.ts — Reusable value formatting utilities.
 */

/**
 * Format a numeric price with a dollar prefix and 2 decimal places.
 * Returns `'---'` when the value is falsy/undefined.
 *
 * @example formatPrice(150.1234) → "$150.12"
 */
export function formatPrice(value: number | undefined): string {
  if (!value && value !== 0) return '---';
  return `$${value.toFixed(2)}`;
}

/**
 * Format an ISO timestamp as `HH:MM:SS` (local time, short form).
 *
 * @example formatTimeShort('2024-01-01T13:05:09Z') → "01:05:09 PM"
 */
export function formatTimeShort(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format an ISO timestamp as a full locale-aware date/time string.
 *
 * @example formatTimeFull('2024-01-01T13:05:09Z') → "1/1/2024, 1:05:09 PM"
 */
export function formatTimeFull(iso: string): string {
  return new Date(iso).toLocaleString();
}

/**
 * Format a number as a localized string with no extra options.
 * Useful for threshold display (e.g., `30,000`).
 */
export function formatLocaleNumber(value: number): string {
  return value.toLocaleString();
}
