// Pure geometry for the SVG charts. Kept free of React so it can be unit-tested.

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
