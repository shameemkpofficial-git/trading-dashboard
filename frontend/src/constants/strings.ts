/**
 * constants/strings.ts — All user-visible display strings.
 * Centralising these makes i18n and copy changes straightforward.
 */

// ─── App / Header ─────────────────────────────────────────────────────────────

export const APP_TITLE        = 'Trading Dashboard PRO';
export const APP_SHORT_NAME   = 'Trading PRO';
export const APP_LOGO_INITIALS = 'TP';

// ─── Auth Page ────────────────────────────────────────────────────────────────

export const AUTH_WELCOME_SUBTITLE   = 'Welcome back to the dashboard';
export const AUTH_REGISTER_SUBTITLE  = 'Create your professional account';

export const LABEL_USERNAME = 'Username';
export const LABEL_PASSWORD = 'Password';
export const PLACEHOLDER_USERNAME = 'Enter your username';
export const PLACEHOLDER_PASSWORD = 'Enter your password';

export const BTN_LOGIN    = 'Login';
export const BTN_REGISTER = 'Register';
export const BTN_LOGOUT   = 'Logout';

export const LINK_NO_ACCOUNT = "Don't have an account? Register";
export const LINK_HAS_ACCOUNT = 'Already have an account? Login';

// ─── Auth Errors / Messages ───────────────────────────────────────────────────

export const ERR_LOGIN_FAILED        = 'Login failed';
export const ERR_REGISTER_FAILED     = 'Registration failed';
export const ERR_SERVER_CONNECTION   = 'Server connection failed';
export const MSG_REGISTER_SUCCESS    = 'Registration successful! Please login.';

// ─── Panel Titles ─────────────────────────────────────────────────────────────

export const PANEL_MARKETS   = 'Markets';
export const PANEL_ALERTS    = 'Price Alerts';
export const PANEL_STATS     = 'Market Stats';

// ─── Market Stats ─────────────────────────────────────────────────────────────

export const STAT_LABEL_PRICE   = 'Price';
export const STAT_LABEL_CHANGE  = '24h Change';
export const STAT_LABEL_VOLUME  = 'Volume';

export const STAT_PLACEHOLDER   = '---';
export const STAT_CHANGE_VALUE  = '+2.45%';
export const STAT_VOLUME_VALUE  = '$1.2B';

// ─── Ticker List ─────────────────────────────────────────────────────────────

export const TICKER_LOADING = 'Loading...';

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const ALERT_ABOVE_LABEL = '↑ Above';
export const ALERT_BELOW_LABEL = '↓ Below';
export const ALERT_ABOVE_ARROW = '↑';
export const ALERT_BELOW_ARROW = '↓';

export const ALERT_BTN_ADD      = 'Add';
export const ALERT_BTN_LOADING  = '…';
export const ALERT_PLACEHOLDER_PRICE = 'Price';

export const ALERT_SECTION_ACTIVE   = 'Active';
export const ALERT_SECTION_TRIGGERED = 'Triggered';
export const ALERT_SECTION_FIRED    = 'fired';
export const ALERT_EMPTY            = 'No active alerts';

export const ERR_INVALID_PRICE      = 'Enter a valid positive price.';
export const ERR_CREATE_ALERT       = 'Failed to create alert. Check the server.';

// ─── Alert Toast ──────────────────────────────────────────────────────────────

export const TOAST_LABEL_TRIGGERED = 'Price Alert Triggered';
export const TOAST_PRICE_PREFIX    = 'Now:';
