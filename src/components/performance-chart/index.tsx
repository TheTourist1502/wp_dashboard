import { keepPreviousData, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { type KeyboardEvent, type MouseEvent, useId, useMemo, useState } from 'react';

import { dashboardQueries } from '../../api';
import { useSelectedPortfolio } from '../../hooks/use-selected-portfolio';
import { useAppDispatch, useAppSelector } from '../../store';
import { benchmarkToggled, rangeSelected } from '../../store/dashboard-slice';
import type { Performance, PerformanceRange } from '../../types';
import { indexTicks, linePath, type Series, ticks, yDomain } from '../../utils/chart';
import { money, pointLabel, signedPct, toneText,toNum } from '../../utils/format';
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
const BENCHMARKS = [
  { symbol: '^GSPC', label: 'S&P 500', stroke: 'stroke-accent-teal', bg: 'bg-accent-teal' },
  { symbol: '^IXIC', label: 'NASDAQ', stroke: 'stroke-accent-amber', bg: 'bg-accent-amber' },
  { symbol: '^DJI', label: 'Dow Jones', stroke: 'stroke-muted', bg: 'bg-muted' },
];
const benchStyle = (symbol: string) =>
  BENCHMARKS.find((b) => b.symbol === symbol) ?? BENCHMARKS[BENCHMARKS.length - 1];

const W = 800;
const H = 250;

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
                      on ? 'border-hairline bg-surface-card text-ink' : 'border-hairline-soft text-muted',
                    )}
                  >
                    <span
                      aria-hidden
                      className={clsx('h-0.5 w-3 rounded-full', on ? b.bg : 'bg-hairline')}
                    />
                    {b.label}
                    {on && ret !== undefined && <span className={toneText(ret)}>{signedPct(ret)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          {q.data.portfolio.points.length < 2 ? (
            <EmptyState>No performance data for this range yet.</EmptyState>
          ) : (
            <Chart perf={q.data} />
          )}
        </div>
      )}
    </Widget>
  );
}

function Chart({ perf }: { perf: Performance }) {
  const gradientId = `perf-fill-${useId().replace(/:/g, '')}`;
  const [hover, setHover] = useState<number | null>(null);

  const m = useMemo(() => {
    const pts = perf.portfolio.points;
    const n = pts.length;
    const at = new Map(pts.map((p, i) => [p.t, i]));
    const port = pts.map((p) => toNum(p.returnPct));
    // Benchmarks can have fewer points (e.g. a late first print); align them by timestamp.
    const bench = perf.benchmarks.map((b) => {
      const vals: Series = new Array(n).fill(undefined);
      for (const p of b.points) {
        const i = at.get(p.t);
        if (i !== undefined) vals[i] = toNum(p.returnPct);
      }
      const { stroke, bg } = benchStyle(b.symbol);
      return { symbol: b.symbol, label: b.label, vals, stroke, bg };
    });
    const dom = yDomain([port, ...bench.map((b) => b.vals)]);
    const x = (i: number) => (i / (n - 1)) * W;
    const y = (v: number) => H - ((v - dom[0]) / (dom[1] - dom[0])) * H;
    const line = linePath(port, x, y);
    const digits = dom[1] - dom[0] < 3 ? 2 : 1;
    return {
      pts,
      n,
      port,
      bench,
      x,
      y,
      line,
      area: `${line} L${W} ${H} L0 ${H} Z`,
      zeroY: y(0),
      yTicks: ticks(dom).map((v) => ({
        y: y(v),
        label: `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits)}%`,
      })),
      xTicks: indexTicks(n).map((i) => ({ i, label: pointLabel(pts[i].t, perf.range === '1Y') })),
      withYear: perf.range === '1Y',
    };
  }, [perf]);

  const pctX = (i: number) => (m.x(i) / W) * 100;
  const pctY = (v: number) => (m.y(v) / H) * 100;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(Math.round(f * (m.n - 1)));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const step = e.key === 'ArrowLeft' ? -1 : 1;
    setHover((h) => Math.min(m.n - 1, Math.max(0, (h ?? m.n - 1) + step)));
  };

  const cursor = hover ?? m.n - 1;
  const valueText = `${pointLabel(m.pts[cursor].t, m.withYear)}, ${money(m.pts[cursor].value)}`;
  const last = m.port[m.n - 1];
  const summary = `Portfolio ${signedPct(last)}${m.bench
    .map((b) => {
      const v = [...b.vals].reverse().find((x) => x !== undefined);
      return v === undefined ? '' : `, ${b.label} ${signedPct(v)}`;
    })
    .join('')}. Use left and right arrow keys to inspect points.`;

  return (
    <div className="flex gap-3">
      <div aria-hidden className="relative h-64 w-12 shrink-0">
        {m.yTicks.map((t) => (
          <span
            key={t.label}
            className="absolute right-0 -translate-y-1/2 font-mono text-caption text-muted"
            style={{ top: `${(t.y / H) * 100}%` }}
          >
            {t.label}
          </span>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div
          role="slider"
          aria-label={summary}
          aria-valuemin={0}
          aria-valuemax={m.n - 1}
          aria-valuenow={cursor}
          aria-valuetext={valueText}
          tabIndex={0}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
          className={clsx('relative h-64 cursor-crosshair rounded-xs', focusRing)}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            aria-hidden
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1" className="text-primary">
                <stop offset="0" stopColor="currentColor" stopOpacity={0.28} />
                <stop offset="1" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>
            {m.yTicks.map((t) => (
              <line
                key={t.label}
                x1={0}
                x2={W}
                y1={t.y}
                y2={t.y}
                className="stroke-hairline-soft"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <line
              x1={0}
              x2={W}
              y1={m.zeroY}
              y2={m.zeroY}
              className="stroke-muted"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
            <path d={m.area} fill={`url(#${gradientId})`} />
            {m.bench.map((b) => (
              <path
                key={b.symbol}
                d={linePath(b.vals, m.x, m.y)}
                fill="none"
                className={b.stroke}
                strokeWidth={1.5}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              d={m.line}
              fill="none"
              className="stroke-primary"
              strokeWidth={2.25}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {hover !== null && (
              <line
                x1={m.x(hover)}
                x2={m.x(hover)}
                y1={0}
                y2={H}
                className="stroke-muted"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {hover !== null && <Tooltip m={m} i={hover} left={pctX(hover)} pctY={pctY} />}
        </div>

        <div aria-hidden className="relative h-4">
          {m.xTicks.map((t, k) => (
            <span
              key={t.i}
              className={clsx(
                'absolute whitespace-nowrap font-mono text-caption text-muted',
                k === 0 ? '' : k === m.xTicks.length - 1 ? '-translate-x-full' : '-translate-x-1/2',
              )}
              style={{ left: `${pctX(t.i)}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

type ChartModel = {
  pts: Performance['portfolio']['points'];
  port: number[];
  bench: { symbol: string; label: string; vals: Series; bg: string }[];
  withYear: boolean;
};

function Tooltip({
  m,
  i,
  left,
  pctY,
}: {
  m: ChartModel;
  i: number;
  left: number;
  pctY: (v: number) => number;
}) {
  const rows = [
    { label: 'Portfolio', bg: 'bg-primary', v: m.port[i] as number | undefined },
    ...m.bench.map((b) => ({ label: b.label, bg: b.bg, v: b.vals[i] })),
  ];

  return (
    <>
      {rows.map(
        (r) =>
          r.v !== undefined && (
            <span
              key={r.label}
              aria-hidden
              className={clsx(
                'pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface-soft',
                r.bg,
              )}
              style={{ left: `${left}%`, top: `${pctY(r.v)}%` }}
            />
          ),
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1.5 flex min-w-48 -translate-x-1/2 flex-col gap-1.5 rounded-md border border-hairline bg-surface-card px-3 py-2.5"
        style={{ left: `${Math.min(84, Math.max(16, left))}%` }}
      >
        <span className="text-caption font-medium text-muted">
          {pointLabel(m.pts[i].t, m.withYear)}
        </span>
        <span className="text-title-sm font-medium text-ink">{money(m.pts[i].value)}</span>
        {rows.map((r) => (
          <span key={r.label} className="flex items-center gap-2 text-caption text-muted">
            <Legend swatch={r.bg}>{r.label}</Legend>
            <span className={clsx('ml-auto font-medium', r.v === undefined ? '' : toneText(r.v))}>
              {r.v === undefined ? '—' : signedPct(r.v)}
            </span>
          </span>
        ))}
      </div>
    </>
  );
}
