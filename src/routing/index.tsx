import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  RouterProvider,
} from '@tanstack/react-router';
import { Suspense } from 'react';

import { APP_ROUTES } from '../constants/routes';
import { createRoutes } from './route-config';

// Standalone router for running this remote on its own port. The host never loads this file.
const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<p>Loading…</p>}>
      <Outlet />
    </Suspense>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: APP_ROUTES.DASHBOARD.navigate });
  },
});

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, ...createRoutes(rootRoute)]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function RoutingConfig() {
  return <RouterProvider router={router} />;
}
