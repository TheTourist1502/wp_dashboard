import { queryOptions } from '@tanstack/react-query';
import { http } from 'wp_shared/http_service';

import { API_ENDPOINTS } from '../constants';
import type {
  DashboardSummary,
  Holding,
  MarketIndices,
  Mover,
  MoverType,
  NewsArticle,
  NewsScope,
  Performance,
  PerformanceRange,
  Portfolio,
  Transaction,
} from '../types';

const PRICES = 60_000;
const PORTFOLIO = 5 * 60_000;

// `?a=1&b=2`, skipping undefined values; '' when nothing is left.
function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const entries = Object.entries(params).filter(
    (entry): entry is [string, string | number] => entry[1] !== undefined,
  );
  const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
  return qs ? `${path}?${qs}` : path;
}

// One query per widget, so each card loads, fails and retries on its own.
// `portfolioId` undefined = all portfolios.
export const dashboardQueries = {
  portfolios: () =>
    queryOptions({
      queryKey: ['portfolios'],
      queryFn: () => http.get<Portfolio[]>(API_ENDPOINTS.PORTFOLIOS.LIST),
      staleTime: PORTFOLIO,
    }),

  summary: (portfolioId?: string) =>
    queryOptions({
      queryKey: ['dashboard', 'summary', portfolioId ?? 'all'],
      queryFn: () =>
        http.get<DashboardSummary>(withQuery(API_ENDPOINTS.DASHBOARD.SUMMARY, { portfolioId })),
      staleTime: PRICES,
    }),

  holdings: (portfolioId?: string) =>
    queryOptions({
      queryKey: ['dashboard', 'holdings', portfolioId ?? 'all'],
      queryFn: () =>
        http.get<Holding[]>(withQuery(API_ENDPOINTS.DASHBOARD.HOLDINGS, { portfolioId })),
      staleTime: PRICES,
    }),

  performance: (range: PerformanceRange, benchmarks: string[], portfolioId?: string) =>
    queryOptions({
      queryKey: ['dashboard', 'performance', portfolioId ?? 'all', range, benchmarks],
      queryFn: () =>
        http.get<Performance>(
          withQuery(API_ENDPOINTS.DASHBOARD.PERFORMANCE, {
            range,
            benchmarks: benchmarks.length ? benchmarks.join(',') : undefined,
            portfolioId,
          })
        ),
      staleTime: range === '1D' ? PRICES : PORTFOLIO,
    }),

  indices: () =>
    queryOptions({
      queryKey: ['market', 'indices'],
      queryFn: () => http.get<MarketIndices>(API_ENDPOINTS.MARKET.INDICES),
      staleTime: PRICES,
    }),

  movers: (type: MoverType, limit = 4) =>
    queryOptions({
      queryKey: ['market', 'movers', type, limit],
      queryFn: () =>
        http.get<Mover[]>(withQuery(API_ENDPOINTS.MARKET.MOVERS, { type, limit })),
      staleTime: PRICES,
    }),

  news: (scope: NewsScope, limit = 3) =>
    queryOptions({
      queryKey: ['news', scope, limit],
      queryFn: () =>
        http.get<NewsArticle[]>(
          withQuery(scope === 'market' ? API_ENDPOINTS.NEWS.MARKET : API_ENDPOINTS.NEWS.HOLDINGS, {
            limit,
          })
        ),
      staleTime: PORTFOLIO,
    }),

  transactions: (portfolioId: string, limit = 5) =>
    queryOptions({
      queryKey: ['portfolios', portfolioId, 'transactions', limit],
      queryFn: () =>
        http.get<Transaction[]>(
          withQuery(API_ENDPOINTS.PORTFOLIOS.TRANSACTIONS(portfolioId), { limit })
        ),
      staleTime: PORTFOLIO,
    }),
};
