import { type AnyRoute, createRoute } from '@tanstack/react-router';

import { APP_ROUTES } from '../constants/routes';
import { lazyComponents } from './lazy-components';

// Exposed as `wp_dashboard/routes`. The host passes its layout route as `parent`;
// standalone dev (routing/index.tsx) passes a bare root route.
export function createRoutes<TParent extends AnyRoute>(parent: TParent) {
  const dashboardRoute = createRoute({
    getParentRoute: () => parent,
    path: APP_ROUTES.DASHBOARD.path,
    component: lazyComponents.LazyDashboard,
  });

  return [dashboardRoute] as const;
}
