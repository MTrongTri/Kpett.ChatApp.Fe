# Architecture

Use this reference for route, module, and dependency decisions in the Kpett ChatApp frontend.

## Stack

- Next.js 16 App Router with React 19 and TypeScript.
- Tailwind CSS v4 with tokens defined in `src/app/globals.css`.
- shadcn/ui New York style configured in `components.json`.
- React Query for server state.
- Redux Toolkit and redux-persist for selected client state.
- SignalR for realtime chat and presence.
- axios through `src/lib/axios.ts` for backend API calls.

## Source layout

- `src/app`: routes, route groups, layouts, and route handlers.
- `src/app/(auth)`: authentication and onboarding pages.
- `src/app/(main)`: authenticated app shell and main product routes.
- `src/components/ui`: shadcn/ui primitives.
- `src/components`: reusable domain components shared across routes.
- `src/hooks`: feature hooks grouped by domain.
- `src/services`: backend-facing service modules.
- `src/types`: shared response, model, and DTO types.
- `src/lib`: shared utility functions, axios setup, cookie helpers, and formatting helpers.
- `src/store`: Redux store and feature slices.

## Routing and components

- Keep route-specific UI near the route when it is not reused elsewhere.
- Move UI into `src/components/<domain>` when it is shared across routes or product surfaces.
- Treat files using hooks, browser APIs, event handlers, React Query, Redux, SignalR, or local state as client components and add `"use client"`.
- Keep server components free of browser-only imports and client providers.
- Preserve existing route groups and layouts instead of flattening paths.

## Imports and types

- Use `@/` aliases for app source imports.
- Keep TypeScript types in `src/types` when they represent shared API or model contracts.
- Prefer typed service and hook returns over `any`.
- Avoid introducing parallel utility implementations when `src/lib` already has a helper.

## API access

- Use `src/lib/axios.ts` as the only shared HTTP client for backend API calls.
- Add or extend a module in `src/services` for backend endpoints.
- Keep proxy route handlers under `src/app/api` only for auth/session behavior or Next-specific server concerns.
- Preserve the normalized error contract returned by the axios interceptor.
