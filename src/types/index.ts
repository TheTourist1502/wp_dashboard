// API shapes as the backend sends them. Money and percentages arrive as decimal strings.
// ponytail: local to wp_dashboard; move to wp_shared when a second app needs them.

export type Decimal = string;

export type Portfolio = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketState = 'PRE' | 'REGULAR' | 'POST' | 'CLOSED' | (string & {});

export type DashboardSummary = {
  sessionDate: string;
  marketState: MarketState;
  currency: string;
  asOf: string;
  holdingsCount: number;
  marketValue: Decimal;
  invested: Decimal;
  todayPnl: Decimal;
  todayPnlPct: Decimal;
  totalReturn: Decimal;
  totalReturnPct: Decimal;
  realizedPnl: Decimal;
  overallPnl: Decimal;
};

export type Holding = {
  symbol: string;
  name: string;
  sector: string | null;
  quoteType: string;
  quantity: Decimal;
  averageCost: Decimal;
  costBasis: Decimal;
  price: Decimal;
  previousClose: Decimal;
  todayChange: Decimal;
  todayChangePct: Decimal;
  todayPnl: Decimal;
  marketValue: Decimal;
  totalPnl: Decimal;
  totalReturnPct: Decimal;
  weightPct: Decimal;
  quoteAsOf: string;
};

export type PerformanceRange = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y';

export type Performance = {
  range: PerformanceRange;
  interval: string;
  portfolio: {
    returnPct: Decimal;
    points: { t: string; value: Decimal; returnPct: Decimal }[];
  };
  benchmarks: {
    symbol: string;
    label: string;
    returnPct: Decimal;
    points: { t: string; returnPct: Decimal }[];
  }[];
};

export type MarketIndex = {
  symbol: string;
  label: string;
  price: Decimal;
  change: Decimal;
  changePercent: Decimal;
};

export type MarketIndices = { marketState: MarketState; asOf: string; indices: MarketIndex[] };

export type MoverType = 'gainers' | 'losers';

export type Mover = { symbol: string; name: string; price: Decimal; changePercent: Decimal };

export type NewsScope = 'market' | 'holdings';

export type NewsArticle = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  symbols: string[];
};

export type Transaction = {
  id: string;
  portfolioId: string;
  type: 'buy' | 'sell';
  symbol: string;
  quantity: Decimal;
  price: Decimal;
  fee: Decimal;
  realizedPnl: Decimal | null;
  executedAt: string;
  createdAt: string;
  updatedAt: string;
};
