import { areaY, crosshair, defineChart, lineY, ruleY } from '@tanstack/charts';
import { Chart as TsChart } from '@tanstack/charts/react/tooltip';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useMemo } from 'react';

import { dashboardQueries } from '../../api';
import { useSelectedPortfolio } from '../../hooks/use-selected-portfolio';
import { useAppDispatch, useAppSelector } from '../../store';
import { benchmarkToggled, rangeSelected } from '../../store/dashboard-slice';
import type { Performance, PerformanceRange } from '../../types';
import { money, pointLabel, signedPct, toneText, toNum } from '../../utils/format';
import SegmentedControl from '../segmented-control';
import Widget, { EmptyState, ErrorState, focusRing, Legend, Skeleton } from '../widget';

const RANGES: { value: PerformanceRange; label: string; long: string }[] = [
  { value: '1D', label: '1D', long: 'Today' },
  { value: '1W', label: '1W', long: 'Past week' },
  { value: '1M', label: '1M', long: 'Past month' },
  { value: '3M', label: '3M', long: 'Past 3 months' },
  { value: '1Y', label: '1Y', long: 'Past year' },
];

// Series order after the portfolio (coral): teal, amber, then muted — per DESIGN.md.
// `color` feeds the chart renderer, which needs a CSS paint rather than a Tailwind class.
const BENCHMARKS = [
  {
    symbol: '^GSPC',
    label: 'S&P 500',
    color: 'hsl(var(--accent-teal))',
    bg: 'bg-accent-teal',
  },
  {
    symbol: '^IXIC',
    label: 'NASDAQ',
    color: 'hsl(var(--accent-amber))',
    bg: 'bg-accent-amber',
  },
  {
    symbol: '^DJI',
    label: 'Dow Jones',
    color: 'hsl(var(--muted))',
    bg: 'bg-muted',
  },
];
const PORTFOLIO = {
  label: 'Portfolio',
  color: 'hsl(var(--primary))',
  bg: 'bg-primary',
};
const benchStyle = (symbol: string) =>
  BENCHMARKS.find((b) => b.symbol === symbol) ?? BENCHMARKS[BENCHMARKS.length - 1];

// GET /api/dashboard/performance?range=&benchmarks=[&portfolioId=]
export default function PerformanceChart({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const range = useAppSelector((s) => s.dashboard.range);
  const benchmarks = useAppSelector((s) => s.dashboard.benchmarks);
  const { portfolioId } = useSelectedPortfolio();
  const q = useQuery({
    ...dashboardQueries.performance(range, benchmarks, portfolioId),
    placeholderData: keepPreviousData,
  });

  return (
    <Widget
      title="Performance"
      className={className}
      actions={
        <SegmentedControl
          label="Time range"
          options={RANGES}
          value={range}
          onChange={(r) => dispatch(rangeSelected(r))}
        />
      }
    >
      {q.isPending ? (
        <Skeleton rows={5} />
      ) : q.isError ? (
        <ErrorState what="performance" onRetry={q.refetch} />
      ) : (
        <div className={clsx('flex flex-col gap-5', q.isPlaceholderData && 'opacity-60')}>
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-caption font-medium text-muted">
                <Legend swatch="bg-primary">
                  Portfolio · {RANGES.find((r) => r.value === range)?.long}
                </Legend>
              </span>
              <span
                className={clsx(
                  'font-display text-display-md font-medium',
                  toneText(q.data.portfolio.returnPct),
                )}
              >
                {signedPct(q.data.portfolio.returnPct)}
              </span>
            </div>
            <div className="ml-auto flex flex-wrap gap-2" role="group" aria-label="Benchmarks">
              {BENCHMARKS.map((b) => {
                const on = benchmarks.includes(b.symbol);
                const ret = q.data.benchmarks.find((x) => x.symbol === b.symbol)?.returnPct;
                return (
                  <button
                    key={b.symbol}
                    type="button"
                    aria-pressed={on}
                    onClick={() => dispatch(benchmarkToggled(b.symbol))}
                    className={clsx(
                      'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-caption font-medium',
                      focusRing,
                      on
                        ? 'border-hairline bg-surface-card text-ink'
                        : 'border-hairline-soft text-muted',
                    )}
                  >
                    <span
                      aria-hidden
                      className={clsx('h-0.5 w-3 rounded-full', on ? b.bg : 'bg-hairline')}
                    />
                    {b.label}
                    {on && ret !== undefined && (
                      <span className={toneText(ret)}>{signedPct(ret)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {q.data.portfolio.points.length < 2 ? (
            <EmptyState>No performance data for this range yet.</EmptyState>
          ) : (
            <PerfChart perf={q.data} />
          )}
        </div>
      )}
    </Widget>
  );
}

type Row = { i: number; series: string; v: number; color: string; bg: string };

function PerfChart({ perf }: { perf: Performance }) {
  const { definition, summary } = useMemo(() => {
    const pts = perf.portfolio.points;
    const at = new Map(pts.map((p, i) => [p.t, i]));
    const withYear = perf.range === '1Y';
    const port: Row[] = pts.map((p, i) => ({
      i,
      series: PORTFOLIO.label,
      v: toNum(p.returnPct),
      ...PORTFOLIO,
    }));
    // Benchmarks can have fewer points (e.g. a late first print); align them by timestamp.
    const bench: Row[] = perf.benchmarks.flatMap((b) => {
      const { color, bg } = benchStyle(b.symbol);
      return b.points.flatMap((p) => {
        const i = at.get(p.t);
        return i === undefined ? [] : [{ i, series: b.label, v: toNum(p.returnPct), color, bg }];
      });
    });
    const rows = [...port, ...bench];
    const pct = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}%`;
    const lastOf = (s: string) => [...rows].reverse().find((r) => r.series === s)?.v;

    const definition = defineChart({
      marks: [
        crosshair({ y: false, stroke: 'hsl(var(--muted))' }),
        areaY(port, {
          x: 'i',
          y: 'v',
          fill: PORTFOLIO.color,
          fillOpacity: 0.16,
        }),
        ruleY([0], { stroke: 'hsl(var(--muted))', strokeDasharray: '3 4' }),
        lineY(bench, {
          x: 'i',
          y: 'v',
          z: 'series',
          stroke: (r) => r.color,
          strokeWidth: 1.5,
        }),
        lineY(port, {
          x: 'i',
          y: 'v',
          stroke: PORTFOLIO.color,
          strokeWidth: 2.25,
        }),
      ],
      scales: {
        x: {
          scale: scaleLinear,
          axis: {
            ticks: {
              count: 5,
              format: (i: number) =>
                pts[Math.round(i)] ? pointLabel(pts[Math.round(i)].t, withYear) : '',
            },
          },
        },
        y: {
          scale: scaleLinear,
          nice: true,
          grid: true,
          axis: { ticks: { count: 5, format: (v: number) => pct(v) } },
        },
      },
      theme: {
        foreground: 'hsl(var(--muted))',
        muted: 'hsl(var(--muted))',
        grid: 'hsl(var(--hairline-soft))',
      },
      focus: 'group-x',
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip,
    });

    const summary = [PORTFOLIO.label, ...perf.benchmarks.map((b) => b.label)]
      .map((s) => {
        const v = lastOf(s);
        return v === undefined ? '' : `${s} ${signedPct(v)}`;
      })
      .filter(Boolean)
      .join(', ');
    return { definition, summary };
  }, [perf]);

  return (
    <TsChart
      definition={definition}
      height={256}
      ariaLabel={`Performance: ${summary}`}
      className={clsx('font-mono text-caption text-muted', focusRing)}
      renderTooltipBody={({ points }) => {
        const first = points[0]?.datum;
        if (!first) return null;
        const p = perf.portfolio.points[first.i];
        return (
          <div className="flex min-w-48 flex-col gap-1.5 font-sans">
            <span className="text-caption font-medium text-muted">
              {pointLabel(p.t, perf.range === '1Y')}
            </span>
            <span className="text-title-sm font-medium text-ink">{money(p.value)}</span>
            {points.map(({ datum: r }) => (
              <span key={r.series} className="flex items-center gap-2 text-caption text-muted">
                <Legend swatch={r.bg}>{r.series}</Legend>
                <span className={clsx('ml-auto font-medium', toneText(r.v))}>{signedPct(r.v)}</span>
              </span>
            ))}
          </div>
        );
      }}
    />
  );
}
