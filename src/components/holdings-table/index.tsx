import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import { useMemo } from 'react';
import { DataTable, type TableAction } from 'wp_shared/DataTable';

import { dashboardQueries } from '../../api';
import { APP_ROUTES } from '../../constants/routes';
import { useSelectedPortfolio } from '../../hooks/use-selected-portfolio';
import type { Holding } from '../../types';
import { money, pct, quantity, signedMoney, signedPct, toneText, toNum } from '../../utils/format';
import { groupSectors } from '../../utils/sectors';
import Widget, { ErrorState } from '../widget';

const col = createColumnHelper<Holding>();
const right = { align: 'right' } as const;

// Numeric accessors (toNum) so sort and Excel/PDF exports use numbers, not Decimal strings.
function buildColumns(ringOf: (h: Holding) => string, maxWeight: number) {
  return [
    col.accessor((h) => `${h.symbol} ${h.name}`, {
      id: 'symbol',
      header: 'Symbol',
      sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
      cell: ({ row: { original: h } }) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className={clsx(
              'flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-card font-mono text-caption-upper tracking-normal text-ink ring-2',
              ringOf(h),
            )}
          >
            {h.symbol.slice(0, 4)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-medium text-ink">{h.symbol}</span>
            <span className="max-w-48 truncate text-caption text-muted">{h.name}</span>
          </span>
        </div>
      ),
    }),
    col.accessor((h) => toNum(h.quantity), {
      id: 'quantity',
      header: 'Qty',
      meta: right,
      cell: ({ row }) => quantity(row.original.quantity),
    }),
    col.accessor((h) => toNum(h.price), {
      id: 'price',
      header: 'Price',
      meta: right,
      cell: ({ row: { original: h } }) => (
        <>
          <div className="text-ink">{money(h.price)}</div>
          <div className={clsx('text-caption', toneText(h.todayChangePct))}>
            {signedPct(h.todayChangePct)}
          </div>
        </>
      ),
    }),
    col.accessor((h) => toNum(h.marketValue), {
      id: 'marketValue',
      header: 'Mkt value',
      meta: right,
      cell: ({ row }) => (
        <span className="font-medium text-ink">{money(row.original.marketValue)}</span>
      ),
    }),
    col.accessor((h) => toNum(h.todayPnl), {
      id: 'todayPnl',
      header: 'Today',
      meta: right,
      cell: ({ row }) => (
        <span className={toneText(row.original.todayPnl)}>{signedMoney(row.original.todayPnl)}</span>
      ),
    }),
    col.accessor((h) => toNum(h.totalPnl), {
      id: 'totalPnl',
      header: 'Total return',
      meta: right,
      cell: ({ row: { original: h } }) => (
        <div className={toneText(h.totalPnl)}>
          <div>{signedMoney(h.totalPnl)}</div>
          <div className="text-caption">{signedPct(h.totalReturnPct)}</div>
        </div>
      ),
    }),
    col.accessor((h) => toNum(h.weightPct), {
      id: 'weightPct',
      header: 'Weight',
      meta: right,
      cell: ({ row: { original: h } }) => (
        <div className="flex items-center justify-end gap-2">
          <div aria-hidden className="h-1.5 w-11 overflow-hidden rounded-full bg-hairline-soft">
            <div
              className="h-full rounded-full bg-muted"
              style={{ width: `${(toNum(h.weightPct) / maxWeight) * 100}%` }}
            />
          </div>
          <span className="w-12 text-right">{pct(h.weightPct)}</span>
        </div>
      ),
    }),
  ];
}

// GET /api/dashboard/holdings[?portfolioId=]
export default function HoldingsTable({ className }: { className?: string }) {
  const { portfolioId } = useSelectedPortfolio();
  const q = useQuery(dashboardQueries.holdings(portfolioId));
  const router = useRouter();

  const columns = useMemo(() => {
    const data = q.data ?? [];
    const colors = new Map(groupSectors(data).map((s) => [s.name, s.color.ring]));
    return buildColumns(
      (h) => colors.get(h.sector || 'Other') ?? 'ring-muted/50',
      Math.max(...data.map((h) => toNum(h.weightPct)), 1),
    );
  }, [q.data]);

  const rowActions = (h: Holding): TableAction<Holding>[] => [
    {
      icon: 'lucide:line-chart',
      label: `View ${h.symbol} details`,
      // Route lives in wp_watchlist, unknown to this router's types: push the URL.
      command: () =>
        router.history.push(
          APP_ROUTES.STOCK_DETAIL.navigate.replace('$symbol', encodeURIComponent(h.symbol)),
        ),
    },
  ];

  return (
    <Widget
      title="Holdings"
      flush
      className={className}
      actions={
        q.data && <span className="text-caption text-muted">{q.data.length} positions</span>
      }
    >
      {q.isError ? (
        <div className="px-6 pb-6">
          <ErrorState what="holdings" onRetry={q.refetch} />
        </div>
      ) : (
        <DataTable
          caption="Holdings"
          exportFileName="holdings"
          data={q.data ?? []}
          columns={columns}
          getRowId={(h) => h.symbol}
          getRowActions={rowActions}
          initialSorting={[{ id: 'marketValue', desc: true }]}
          searchPlaceholder="Search symbol or name"
          isLoading={q.isPending}
          emptyMessage="No holdings yet."
        />
      )}
    </Widget>
  );
}
