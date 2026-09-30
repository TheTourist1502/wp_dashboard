# wp_dashboard — Module Federation contract

Feature remote. Runs on port **3002**. Mounted by the host (`wp_layout`) under its
`RootLayout`, or runs on its own for isolated development.

## Folder structure

```
src/
├── constants/
│   └── routes.ts          APP_ROUTES: `path` (segment for createRoute) + `navigate` (full URL)
├── routing/
│   ├── routeConfig.tsx    createRoutes(parent) — EXPOSED as `wp_dashboard/routes`
│   ├── lazyComponents.ts  React.lazy() page imports (one chunk per page)
│   └── index.tsx          standalone router; only used when this repo runs on its own
├── pages/
│   └── Dashboard.tsx
├── index.tsx              entry: renders routing/index.tsx
└── remotes.d.ts           types for what this repo consumes
```

## Exposes

| Key | File | Export | Consumed by |
|---|---|---|---|
| `./routes` | `src/routing/routeConfig.tsx` | `createRoutes<TParent extends AnyRoute>(parent: TParent)` → readonly tuple of routes | `wp_layout` (`src/routing/remoteRoutes.tsx`) |

`createRoutes` builds this module's routes as children of whatever `parent` it gets:

- **In the host**: `parent` is the host's pathless `app` layout route, so pages render inside
  `RootLayout` (header + nav).
- **Standalone**: `parent` is a bare root route from `src/routing/index.tsx`.

Pages receive route params and search as **props**. `routeConfig.tsx` reads them with
`route.useParams()` / `route.useSearch()` and passes them down. Don't call `getRouteApi()` in a
page: the route id is `/app/...` in the host and `/...` standalone, so the lookup fails in one of
them.

## Routes owned

| URL | Constant | Page | Params | Search |
|---|---|---|---|---|
| `/dashboard` | `APP_ROUTES.DASHBOARD` | `pages/Dashboard.tsx` | — | — |

Standalone only: `/` redirects to `/dashboard`.

## Consumes

| Remote | Module | Used for | Type declared in |
|---|---|---|---|
| `wp_shared` | `wp_shared/Card` | `Card` wrapper on every page | `src/remotes.d.ts` |

This repo never imports another feature remote. Cross-module communication goes through the
EventBus in `wp_shared`.

## Shared singletons

| Package | Config |
|---|---|
| `react` | `singleton` |
| `react-dom` | `singleton` |
| `@tanstack/react-query` | `singleton` |
| `@tanstack/react-router` | `singleton` |

Every repo declares the same four. A package missing from `shared` gets bundled twice, and a
second copy of React or the router breaks hooks and context at runtime.

## Environment

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `3002` | Dev and preview port |
| `VITE_WP_SHARED_URL` | `http://localhost:3001/remoteEntry.js` | `wp_shared` remote entry |

## Adding a route

1. Add `{ path, navigate }` to `APP_ROUTES` in `src/constants/routes.ts`.
2. Add the page to `src/pages/` and a lazy import to `src/routing/lazyComponents.ts`.
3. Add a `createRoute({ getParentRoute: () => parent, ... })` in `createRoutes` and include it in
   the returned tuple.
4. Add the URL to `routing.routes` in `.claude/docs/wealth-pulse-config.json`. The host needs no
   change unless the route belongs in the sidebar (`wp_layout/src/constants/menuItems.ts`).

## Run

```bash
pnpm dev          # standalone on :3002 (wp_shared on :3001 must be running)
pnpm type-check
pnpm build
```
