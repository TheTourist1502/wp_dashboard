import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { MoverType, NewsScope, PerformanceRange } from '../types';

// Client-side view state for the dashboard widgets. Server data stays in React Query.
type DashboardState = {
  portfolioId: string | null; // null = all portfolios
  range: PerformanceRange;
  benchmarks: string[];
  moverType: MoverType;
  newsScope: NewsScope;
};

const initialState: DashboardState = {
  portfolioId: null,
  range: '1M',
  benchmarks: ['^GSPC'],
  moverType: 'gainers',
  newsScope: 'market',
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    portfolioSelected(state, action: PayloadAction<string | null>) {
      state.portfolioId = action.payload;
    },
    rangeSelected(state, action: PayloadAction<PerformanceRange>) {
      state.range = action.payload;
    },
    benchmarkToggled(state, action: PayloadAction<string>) {
      const i = state.benchmarks.indexOf(action.payload);
      if (i === -1) state.benchmarks.push(action.payload);
      else state.benchmarks.splice(i, 1);
    },
    moverTypeSelected(state, action: PayloadAction<MoverType>) {
      state.moverType = action.payload;
    },
    newsScopeSelected(state, action: PayloadAction<NewsScope>) {
      state.newsScope = action.payload;
    },
  },
});

export const {
  portfolioSelected,
  rangeSelected,
  benchmarkToggled,
  moverTypeSelected,
  newsScopeSelected,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
