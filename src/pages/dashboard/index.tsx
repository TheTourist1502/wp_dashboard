import { Provider } from 'react-redux';

import HoldingsTable from '../../components/holdings-table';
import MarketIndices from '../../components/market-indices';
import NewsFeed from '../../components/news-feed';
import PerformanceChart from '../../components/performance-chart';
import PortfolioSummary from '../../components/portfolio-summary';
import PortfolioSwitcher from '../../components/portfolio-switcher';
import RecentTransactions from '../../components/recent-transactions';
import SectorAllocation from '../../components/sector-allocation';
import TopMovers from '../../components/top-movers';
import { store } from '../../store';

// Each widget owns its query, so one slow or failing endpoint never blanks the page.
export default function Dashboard() {
  return (
    <Provider store={store}>
      <div className="flex flex-col gap-6 tabular-nums">
        <PortfolioSwitcher />
        <MarketIndices />
        <PortfolioSummary />

        <div className="grid gap-6 lg:grid-cols-3">
          <PerformanceChart className="lg:col-span-2" />
          <SectorAllocation />
        </div>

        <HoldingsTable />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <TopMovers />
          <RecentTransactions />
          <NewsFeed className="md:col-span-2 xl:col-span-1" />
        </div>
      </div>
    </Provider>
  );
}
