// Pure geometry for the SVG charts. Kept free of React so it can be unit-tested.

export type Series = (number | undefined)[];

/** Linear scale covering every value plus zero, padded 12% so lines never touch the edges. */
export function yDomain(series: Series[]): [number, number] {
  let min = 0;
  let max = 0;
  for (const s of series)
    for (const v of s) {
      if (v === undefined) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  const pad = (max - min) * 0.12 || 0.5;
  return [min - pad, max + pad];
}

/** SVG path through the defined points; a gap (undefined) lifts the pen. */
export function linePath(values: Series, x: (i: number) => number, y: (v: number) => number) {
  const parts: string[] = [];
  let pen = false;
  values.forEach((v, i) => {
    if (v === undefined) {
      pen = false;
      return;
    }
    parts.push(`${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`);
    pen = true;
  });
  return parts.join(' ');
}

/** `count` evenly spaced values from max down to min. */
export const ticks = ([min, max]: [number, number], count = 5) =>
  Array.from({ length: count }, (_, i) => max - ((max - min) * i) / (count - 1));

/** `count` evenly spaced indexes across n points, first and last included. */
export const indexTicks = (n: number, count = 5) =>
  n < 2 ? [0] : Array.from({ length: count }, (_, k) => Math.round((k / (count - 1)) * (n - 1)));

/** Donut segments on a circle of circumference `c`, with a small gap between slices. */
export function donutSegments(values: number[], c: number, gap = 1.5) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  let offset = 0;
  return values.map((v) => {
    const len = (v / total) * c;
    const dash = Math.max(len - gap, 0.5);
    const seg = { dash: `${dash} ${c - dash}`, offset: -offset };
    offset += len;
    return seg;
  });
}
