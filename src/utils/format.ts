// Display formatting for API decimal strings. U+2212 minus keeps signed columns aligned.
const MINUS = '−';

const usd = (digits: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
const USD = { 0: usd(0), 2: usd(2) };
const NUM = new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 });
const INDEX = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const toNum = (v: string | number | null | undefined) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const sign = (n: number) => (n > 0 ? '+' : n < 0 ? MINUS : '');

/** $1,234.56 (unsigned). */
export const money = (v: string | number, digits: 0 | 2 = 2) =>
  USD[digits].format(Math.abs(toNum(v)));

/** +$1,234.56 / −$1,234.56 */
export const signedMoney = (v: string | number) => sign(toNum(v)) + money(v);

/** +1.23% / −1.23% */
export const signedPct = (v: string | number) => {
  const n = toNum(v);
  return sign(n) + Math.abs(n).toFixed(2) + '%';
};

/** 1.23% */
export const pct = (v: string | number, digits = 1) => toNum(v).toFixed(digits) + '%';

/** 120 / 0.5 — quantities come back as "20.000000". */
export const quantity = (v: string | number) => NUM.format(toNum(v));

/** 7,699.55 — index levels, no currency. */
export const indexLevel = (v: string | number) => INDEX.format(toNum(v));

/** +28.71 / −131.22 */
export const signedIndex = (v: string | number) =>
  sign(toNum(v)) + indexLevel(Math.abs(toNum(v)));

/** Tailwind text class for a gain/loss value. Zero reads as neutral. */
export const toneText = (v: string | number) => {
  const n = toNum(v);
  return n > 0 ? 'text-success' : n < 0 ? 'text-error' : 'text-muted';
};

/** "5m ago" / "3h ago" / "2d ago" */
export function timeAgo(iso: string, now = Date.now()) {
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / (60 * 24))}d ago`;
}

const ET_TIME = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York',
});
const DAY = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const DAY_YEAR = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: '2-digit',
  timeZone: 'UTC',
});

/** Chart axis label: intraday points as ET clock time, daily points as a date. */
export function pointLabel(t: string, withYear = false) {
  if (t.length > 10) return ET_TIME.format(new Date(t));
  return (withYear ? DAY_YEAR : DAY).format(new Date(t));
}

/** "Wed, Sep 30 · as of 1:21 PM ET" */
export function asOfLabel(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  }).format(d);
  return `${day} · as of ${ET_TIME.format(d)} ET`;
}

/** "Sep 30" for an ISO timestamp, in market time. */
export const shortDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  }).format(new Date(iso));
