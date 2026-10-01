// `path` is the segment passed to createRoute; `navigate` is the full URL for <Link to>.
export const APP_ROUTES = {
  DASHBOARD: { path: 'dashboard', navigate: '/dashboard' },
  // Owned by wp_watchlist; navigated to by URL only (no cross-app import).
  STOCK_DETAIL: { navigate: '/watchlist/$symbol' },
} as const;
