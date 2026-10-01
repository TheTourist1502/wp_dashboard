import { useQuery } from '@tanstack/react-query';

import { dashboardQueries } from '../api';
import { useAppSelector } from '../store';

// The portfolio every widget filters by. An id the user no longer owns (stale store after
// signing in as someone else) falls back to "all" instead of requesting someone else's data.
export function useSelectedPortfolio() {
  const selectedId = useAppSelector((s) => s.dashboard.portfolioId);
  const portfolios = useQuery(dashboardQueries.portfolios());
  const list = portfolios.data ?? [];
  const portfolio = list.find((p) => p.id === selectedId);

  return { portfolioId: portfolio?.id, portfolio, portfolios: list, query: portfolios };
}
