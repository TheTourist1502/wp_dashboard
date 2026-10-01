import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

import { dashboardQueries } from '../../api';
import { useSelectedPortfolio } from '../../hooks/use-selected-portfolio';
import { donutSegments } from '../../utils/chart';
import { money, pct } from '../../utils/format';
import { groupSectors } from '../../utils/sectors';
import Widget, { EmptyState, ErrorState, Skeleton } from '../widget';

const R = 54;
const C = 2 * Math.PI * R;

// Derived from GET /api/dashboard/holdings — shares the HoldingsTable query, so no extra request.
export default function SectorAllocation({ className }: { className?: string }) {
  const { portfolioId } = useSelectedPortfolio();
  const q = useQuery(dashboardQueries.holdings(portfolioId));
  const sectors = useMemo(() => groupSectors(q.data ?? []), [q.data]);
  const [active, setActive] = useState<string | null>(null);

  const segments = donutSegments(
    sectors.map((s) => s.value),
    C,
  );
  const focused = sectors.find((s) => s.name === active);

  return (
    <Widget title="Allocation" className={className}>
      {q.isPending ? (
        <Skeleton rows={5} />
      ) : q.isError ? (
        <ErrorState what="allocation" onRetry={q.refetch} />
      ) : sectors.length === 0 ? (
        <EmptyState>No holdings yet.</EmptyState>
      ) : (
        <>
          <div className="relative size-48 self-center">
            <svg viewBox="0 0 140 140" className="size-full -rotate-90" aria-hidden>
              {sectors.map((s, i) => (
                <circle
                  key={s.name}
                  cx={70}
                  cy={70}
                  r={R}
                  fill="none"
                  className={clsx(s.color.stroke, 'motion-safe:transition-[stroke-width]')}
                  strokeWidth={s.name === active ? 22 : 16}
                  strokeDasharray={segments[i].dash}
                  strokeDashoffset={segments[i].offset}
                  onMouseEnter={() => setActive(s.name)}
                  onMouseLeave={() => setActive(null)}
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
              <span className="font-display text-display-sm font-medium text-ink">
                {focused ? pct(focused.pct) : sectors.length}
              </span>
              <span className="max-w-28 text-caption font-medium text-muted">
                {focused ? focused.name : sectors.length === 1 ? 'sector' : 'sectors'}
              </span>
            </div>
          </div>

          <ul aria-label="Sector allocation" className="flex flex-col gap-0.5">
            {sectors.map((s) => (
              <li
                key={s.name}
                onMouseEnter={() => setActive(s.name)}
                onMouseLeave={() => setActive(null)}
                className={clsx(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-body-sm text-body',
                  s.name === active && 'bg-surface-card',
                )}
              >
                <span aria-hidden className={clsx('size-2.5 shrink-0 rounded-xs', s.color.bg)} />
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
                <span className="text-caption text-muted">{money(s.value, 0)}</span>
                <span className="w-14 text-right font-medium text-ink">{pct(s.pct)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Widget>
  );
}
