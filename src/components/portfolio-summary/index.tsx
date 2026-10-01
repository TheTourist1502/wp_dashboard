import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { dashboardQueries } from '../../api';
import { useSelectedPortfolio } from '../../hooks/use-selected-portfolio';
import type { DashboardSummary } from '../../types';
import { money, signedMoney, signedPct, toneText,toNum } from '../../utils/format';
import { ErrorState, Legend, Skeleton } from '../widget';

// GET /api/dashboard/summary[?portfolioId=]
export default function PortfolioSummary() {
  const { portfolioId } = useSelectedPortfolio();
  const q = useQuery(dashboardQueries.summary(portfolioId));

  return (
    <section
      aria-label="Portfolio summary"
      className="flex flex-col gap-6 rounded-lg border border-hairline-soft bg-surface-soft p-6 md:p-8"
    >
      {q.isPending ? (
        <Skeleton rows={3} />
      ) : q.isError ? (
        <ErrorState what="the portfolio summary" onRetry={q.refetch} />
      ) : (
        <SummaryBody s={q.data} />
      )}
    </section>
  );
}

function SummaryBody({ s }: { s: DashboardSummary }) {
  const stats = [
    { label: 'Invested', value: money(s.invested), tone: 'text-ink', sub: 'Cost basis' },
    {
      label: 'Unrealized return',
      value: signedMoney(s.totalReturn),
      tone: toneText(s.totalReturn),
      sub: `${signedPct(s.totalReturnPct)} all time`,
    },
    {
      label: 'Realized P&L',
      value: signedMoney(s.realizedPnl),
      tone: toneText(s.realizedPnl),
      sub: 'From closed lots',
    },
    {
      label: 'Overall P&L',
      value: signedMoney(s.overallPnl),
      tone: toneText(s.overallPnl),
      sub: 'Realized + unrealized',
    },
  ];
  const up = toNum(s.todayPnl) >= 0;

  return (
    <>
      <div className="flex flex-wrap items-end gap-x-10 gap-y-7">
        <div className="flex flex-1 basis-72 flex-col gap-2.5">
          <span className="text-caption-upper font-medium uppercase text-muted">Market value</span>
          <span className="font-display text-display-lg font-medium text-ink md:text-display-xl">
            {money(s.marketValue)}
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={clsx(
                'rounded-full px-3 py-1 text-body-sm font-medium',
                up ? 'bg-success/15 text-success' : 'bg-error/15 text-error',
              )}
            >
              {signedMoney(s.todayPnl)} · {signedPct(s.todayPnlPct)}
            </span>
            <span className="text-body-sm text-muted">today · {s.holdingsCount} holdings</span>
          </div>
        </div>

        <dl className="grid flex-[2] basis-[520px] grid-cols-2 gap-y-5 lg:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} className="flex flex-col gap-1.5 border-l border-hairline-soft px-5">
              <dt className="text-caption font-medium text-muted">{st.label}</dt>
              <dd className={clsx('text-title-lg font-medium', st.tone)}>{st.value}</dd>
              <dd className="text-caption text-muted">{st.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
      <CostVsValueBar invested={toNum(s.invested)} marketValue={toNum(s.marketValue)} />
    </>
  );
}

// Cost basis vs current value in one bar: the tail is the unrealized gain (or the loss).
function CostVsValueBar({ invested, marketValue }: { invested: number; marketValue: number }) {
  const total = Math.max(invested, marketValue);
  if (total <= 0) return null;
  const base = (Math.min(invested, marketValue) / total) * 100;
  const gain = marketValue >= invested;

  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={`Cost basis ${money(invested)}, market value ${money(marketValue)}`}
        className="flex h-2 overflow-hidden rounded-full bg-hairline-soft"
      >
        <div className="bg-muted" style={{ width: `${base}%` }} />
        <div className={gain ? 'bg-success' : 'bg-error'} style={{ width: `${100 - base}%` }} />
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-caption text-muted">
        <Legend swatch="bg-muted">{gain ? 'Cost basis' : 'Market value'}</Legend>
        <Legend swatch={gain ? 'bg-success' : 'bg-error'}>
          {gain ? 'Unrealized gain' : 'Unrealized loss'}
        </Legend>
      </div>
    </div>
  );
}
