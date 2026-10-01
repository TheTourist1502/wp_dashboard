import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { dashboardQueries } from '../../api';
import { indexLevel, signedIndex, signedPct, toneText } from '../../utils/format';
import { ErrorState, Skeleton } from '../widget';

// GET /api/market/indices — one tile per index.
export default function MarketIndices() {
  const q = useQuery(dashboardQueries.indices());

  if (q.isPending) return <Skeleton rows={1} className="[&>div]:h-20" />;
  if (q.isError) return <ErrorState what="market indices" onRetry={q.refetch} />;

  return (
    <section aria-label="Market indices" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {q.data.indices.map((ix) => (
        <div
          key={ix.symbol}
          className="flex flex-col gap-1 rounded-lg border border-hairline-soft bg-surface-soft px-5 py-4"
        >
          <span className="text-caption font-medium text-muted">{ix.label}</span>
          <span className="text-title-md font-medium text-ink">{indexLevel(ix.price)}</span>
          <span className={clsx('text-caption font-medium', toneText(ix.change))}>
            {signedIndex(ix.change)} · {signedPct(ix.changePercent)}
          </span>
        </div>
      ))}
    </section>
  );
}
