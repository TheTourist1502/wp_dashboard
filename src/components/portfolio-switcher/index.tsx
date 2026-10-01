import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { dashboardQueries } from '../../api';
import { useSelectedPortfolio } from '../../hooks/use-selected-portfolio';
import { useAppDispatch } from '../../store';
import { portfolioSelected } from '../../store/dashboard-slice';
import type { MarketState } from '../../types';
import { asOfLabel } from '../../utils/format';
import SegmentedControl from '../segmented-control';

const ALL = 'all';

const MARKET_LABEL: Record<string, string> = {
  PRE: 'Pre-market',
  REGULAR: 'Market open',
  POST: 'After hours',
};
const marketLabel = (s: MarketState) => MARKET_LABEL[s] ?? 'Market closed';

// Page heading + portfolio filter. GET /api/portfolios, market status from /api/market/indices.
export default function PortfolioSwitcher() {
  const dispatch = useAppDispatch();
  const { portfolio, portfolios } = useSelectedPortfolio();
  const market = useQuery(dashboardQueries.indices());

  const description = portfolio
    ? portfolio.description
    : portfolios.length > 1
      ? `Combined view across ${portfolios.map((p) => p.name).join(', ')}`
      : null;

  return (
    <section className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex min-w-0 flex-col gap-2.5">
        {market.data && (
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-card px-3 py-1 text-caption font-medium text-ink">
              <span
                aria-hidden
                className={clsx(
                  'size-1.5 rounded-full',
                  market.data.marketState === 'REGULAR' ? 'bg-success' : 'bg-muted',
                )}
              />
              {marketLabel(market.data.marketState)}
            </span>
            <span className="text-body-sm text-muted">{asOfLabel(market.data.asOf)}</span>
          </div>
        )}
        <h1 className="font-display text-display-md font-medium text-ink md:text-display-lg">
          {portfolio?.name ?? 'Dashboard'}
        </h1>
        {description && <p className="text-body-sm text-muted">{description}</p>}
      </div>

      {portfolios.length > 1 && (
        <SegmentedControl
          label="Portfolio"
          value={portfolio?.id ?? ALL}
          options={[
            { value: ALL, label: 'All' },
            ...portfolios.map((p) => ({ value: p.id, label: p.name })),
          ]}
          onChange={(id) => dispatch(portfolioSelected(id === ALL ? null : id))}
        />
      )}
    </section>
  );
}
