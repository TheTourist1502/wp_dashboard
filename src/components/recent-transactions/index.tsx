import { useQueries } from '@tanstack/react-query';

import { dashboardQueries } from '../../api';
import { useSelectedPortfolio } from '../../hooks/use-selected-portfolio';
import type { Transaction } from '../../types';
import { money, quantity, shortDate, signedMoney, toneText,toNum } from '../../utils/format';
import Widget, { EmptyState, ErrorState, Skeleton } from '../widget';

const LIMIT = 5;

// GET /api/portfolios/:id/transactions?limit=5. The endpoint is per portfolio, so "All" fetches
// each portfolio's latest five and merges them newest first.
export default function RecentTransactions({ className }: { className?: string }) {
  const { portfolioId, portfolios, query: portfoliosQuery } = useSelectedPortfolio();
  const ids = portfolioId ? [portfolioId] : portfolios.map((p) => p.id);
  const results = useQueries({
    queries: ids.map((id) => dashboardQueries.transactions(id, LIMIT)),
  });

  const nameOf = new Map(portfolios.map((p) => [p.id, p.name]));
  const pending = portfoliosQuery.isPending || results.some((r) => r.isPending);
  const failed = portfoliosQuery.isError ? portfoliosQuery : results.find((r) => r.isError);
  const txs: Transaction[] = results
    .flatMap((r) => r.data ?? [])
    .sort((a, b) => Date.parse(b.executedAt) - Date.parse(a.executedAt))
    .slice(0, LIMIT);

  return (
    <Widget title="Recent activity" className={className}>
      {pending ? (
        <Skeleton rows={5} />
      ) : failed ? (
        <ErrorState what="recent activity" onRetry={failed.refetch} />
      ) : txs.length === 0 ? (
        <EmptyState>No transactions yet.</EmptyState>
      ) : (
        <ul className="flex flex-col">
          {txs.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 border-t border-hairline-soft py-3 first:border-t-0"
            >
              <span className="w-12 shrink-0 rounded-full bg-surface-card py-1 text-center text-caption-upper font-medium uppercase tracking-normal text-ink">
                {t.type}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body-sm font-medium text-ink">
                  {t.symbol}{' '}
                  <span className="font-normal text-muted">
                    · {quantity(t.quantity)} @ {money(t.price)}
                  </span>
                </span>
                <span className="truncate text-caption text-muted">
                  {shortDate(t.executedAt)}
                  {portfolios.length > 1 && ` · ${nameOf.get(t.portfolioId) ?? 'Portfolio'}`}
                </span>
              </span>
              <span className="flex flex-col items-end">
                <span className="text-body-sm font-medium text-ink">
                  {money(toNum(t.quantity) * toNum(t.price))}
                </span>
                {t.realizedPnl === null ? (
                  <span className="text-caption text-muted">Open lot</span>
                ) : (
                  <span className={`text-caption ${toneText(t.realizedPnl)}`}>
                    {signedMoney(t.realizedPnl)} realized
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Widget>
  );
}
