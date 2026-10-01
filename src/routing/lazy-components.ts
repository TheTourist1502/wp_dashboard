import { lazy } from 'react';

export const lazyComponents = {
  LazyDashboard: lazy(() => import('../pages/dashboard')),
};
