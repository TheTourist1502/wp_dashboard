import type { Holding } from '../types';
import { toNum } from './format';

// Series palette per DESIGN.md (coral, teal, amber, muted), then the same at half strength.
// Literal class strings so Tailwind can see them.
export const SERIES = [
  { stroke: 'stroke-primary', bg: 'bg-primary', ring: 'ring-primary' },
  { stroke: 'stroke-accent-teal', bg: 'bg-accent-teal', ring: 'ring-accent-teal' },
  { stroke: 'stroke-accent-amber', bg: 'bg-accent-amber', ring: 'ring-accent-amber' },
  { stroke: 'stroke-muted', bg: 'bg-muted', ring: 'ring-muted' },
  { stroke: 'stroke-primary/50', bg: 'bg-primary/50', ring: 'ring-primary/50' },
  { stroke: 'stroke-accent-teal/50', bg: 'bg-accent-teal/50', ring: 'ring-accent-teal/50' },
  { stroke: 'stroke-accent-amber/50', bg: 'bg-accent-amber/50', ring: 'ring-accent-amber/50' },
  { stroke: 'stroke-muted/50', bg: 'bg-muted/50', ring: 'ring-muted/50' },
] as const;

export type SeriesColor = (typeof SERIES)[number];

export type SectorSlice = { name: string; value: number; pct: number; color: SeriesColor };

const OTHER = 'Other';

/** Holdings grouped by sector, largest first. Past the palette size the tail folds into "Other". */
export function groupSectors(holdings: Holding[]): SectorSlice[] {
  const sums = new Map<string, number>();
  for (const h of holdings) {
    const name = h.sector || OTHER;
    sums.set(name, (sums.get(name) ?? 0) + toNum(h.marketValue));
  }
  let rows = [...sums].sort((a, b) => b[1] - a[1]);
  if (rows.length > SERIES.length) {
    const keep = rows.slice(0, SERIES.length - 1);
    const rest = rows.slice(SERIES.length - 1).reduce((a, [, v]) => a + v, 0);
    rows = [...keep, [OTHER, rest]];
  }
  const total = rows.reduce((a, [, v]) => a + v, 0) || 1;
  return rows.map(([name, value], i) => ({
    name,
    value,
    pct: (value / total) * 100,
    color: SERIES[i],
  }));
}
