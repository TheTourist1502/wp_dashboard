import { keepPreviousData, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { dashboardQueries } from '../../api';
import { useAppDispatch, useAppSelector } from '../../store';
import { moverTypeSelected } from '../../store/dashboard-slice';
import type { MoverType } from '../../types';
import { money, signedPct, toneText,toNum } from '../../utils/format';
import SegmentedControl from '../segmented-control';
import Widget, { EmptyState, ErrorState, Skeleton } from '../widget';

const TABS: { value: MoverType; label: string }[] = [
  { value: 'gainers', label: 'Gainers' },
  { value: 'losers', label: 'Losers' },
];

// GET /api/market/movers?type=&limit=4 — bar length is the move relative to the biggest mover.
export default function TopMovers({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const type = useAppSelector((s) => s.dashboard.moverType);
  const q = useQuery({ ...dashboardQueries.movers(type), placeholderData: keepPreviousData });
  const max = Math.max(...(q.data ?? []).map((m) => Math.abs(toNum(m.changePercent))), 1);

  return (
    <Widget
      title="Market movers"
      className={className}
      actions={
        <SegmentedControl
          label="Movers"
          options={TABS}
          value={type}
          onChange={(t) => dispatch(moverTypeSelected(t))}
        />
      }
    >
      {q.isPending ? (
        <Skeleton rows={4} />
      ) : q.isError ? (
        <ErrorState what="market movers" onRetry={q.refetch} />
      ) : q.data.length === 0 ? (
        <EmptyState>No movers right now.</EmptyState>
      ) : (
        <ul className={clsx('flex flex-col gap-1.5', q.isPlaceholderData && 'opacity-60')}>
          {q.data.map((m) => {
            const change = toNum(m.changePercent);
            return (
              <li key={m.symbol} className="flex flex-col gap-2 rounded-md bg-surface-card px-3.5 py-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-body-sm font-medium text-ink">{m.symbol}</span>
                  <span className="min-w-0 flex-1 truncate text-caption text-muted">{m.name}</span>
                  <span className="text-caption text-body">{money(m.price)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-soft">
                    <div
                      className={clsx('h-full rounded-full', change >= 0 ? 'bg-success' : 'bg-error')}
                      style={{ width: `${(Math.abs(change) / max) * 100}%` }}
                    />
                  </div>
                  <span className={clsx('w-16 text-right text-caption font-medium', toneText(change))}>
                    {signedPct(change)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Widget>
  );
}
