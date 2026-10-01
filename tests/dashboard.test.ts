// Run: npx tsx tests/dashboard.test.ts
import assert from 'node:assert/strict';

import type { Holding } from '../src/types';
import { donutSegments, indexTicks, linePath, yDomain } from '../src/utils/chart';
import { money, pct, quantity, signedMoney, signedPct, toneText } from '../src/utils/format';
import { groupSectors, SERIES } from '../src/utils/sectors';

// format
assert.equal(money('217843.02'), '$217,843.02');
assert.equal(signedMoney('-431.20'), '−$431.20');
assert.equal(signedMoney('1745.32'), '+$1,745.32');
assert.equal(signedPct('0.81'), '+0.81%');
assert.equal(signedPct('-24.71'), '−24.71%');
assert.equal(signedPct('0'), '0.00%');
assert.equal(pct('18.49'), '18.5%');
assert.equal(quantity('20.000000'), '20');
assert.equal(toneText('-0.01'), 'text-error');
assert.equal(toneText('0'), 'text-muted');
assert.equal(money('not a number'), '$0.00');

// chart
assert.deepEqual(yDomain([[1, 2]]), [-0.24, 2.24]); // zero always in range, 12% pad
assert.deepEqual(yDomain([[]]), [-0.5, 0.5]); // flat series still gets a range
const id = (n: number) => n;
assert.equal(linePath([1, undefined, 3, 4], id, id), 'M0.0 1.0 M2.0 3.0 L3.0 4.0');
assert.deepEqual(indexTicks(23), [0, 6, 11, 17, 22]);
assert.deepEqual(indexTicks(1), [0]);
const segs = donutSegments([3, 1], 100, 0);
assert.deepEqual(segs, [
  { dash: '75 25', offset: -0 },
  { dash: '25 75', offset: -75 },
]);

// sectors
const h = (sector: string | null, marketValue: string) => ({ sector, marketValue }) as Holding;
const s = groupSectors([h('Tech', '60'), h('Energy', '10'), h('Tech', '20'), h(null, '10')]);
assert.deepEqual(
  s.map((x) => [x.name, x.value, Math.round(x.pct)]),
  [
    ['Tech', 80, 80],
    ['Energy', 10, 10],
    ['Other', 10, 10],
  ],
);
const many = groupSectors(Array.from({ length: 10 }, (_, i) => h(`S${i}`, String(100 - i))));
assert.equal(many.length, SERIES.length);
assert.equal(many.at(-1)!.name, 'Other');
assert.equal(many.at(-1)!.value, 93 + 92 + 91);

console.log('dashboard tests passed');
