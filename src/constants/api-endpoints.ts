// Endpoints this app calls. Paths relative to VITE_API_URL (which already ends in `/api`).
// Owned here, not in wp_shared: see .claude/rules/architecture.md#api-endpoints.
export const API_ENDPOINTS = {
  PORTFOLIOS: {
    LIST: '/portfolios',
    TRANSACTIONS: (portfolioId: string) => `/portfolios/${portfolioId}/transactions`,
  },
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    HOLDINGS: '/dashboard/holdings',
    PERFORMANCE: '/dashboard/performance',
  },
  MARKET: {
    INDICES: '/market/indices',
    MOVERS: '/market/movers',
  },
  NEWS: {
    MARKET: '/news',
    HOLDINGS: '/news/holdings',
  },
} as const;
