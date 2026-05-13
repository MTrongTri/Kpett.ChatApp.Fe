---
name: kpett-chatapp-frontend-agent
description: Build, modify, review, and debug the Kpett ChatApp frontend. Use when Codex works on UI, Next.js App Router routes and layouts, React components, hooks, services, authentication, chat realtime behavior, posts, profiles, notifications, React Query server state, Redux Toolkit UI/auth state, SignalR integration, Tailwind v4 styling, shadcn/ui components, or frontend API contracts in this project.
---

# Kpett ChatApp Frontend Agent

Use this skill when working in the Kpett ChatApp frontend repository.

## Core workflow

1. Inspect the relevant route, component, hook, service, type, and provider before changing code.
2. Follow existing project boundaries: routes in `src/app`, reusable UI in `src/components`, hooks in `src/hooks`, services in `src/services`, shared helpers in `src/lib`, and shared types in `src/types`.
3. Preserve the app's established stack: Next.js App Router, React 19, TypeScript, Tailwind v4, shadcn/ui, React Query, Redux Toolkit, SignalR, and the shared axios wrapper.
4. Keep changes scoped to the requested behavior and verify with the smallest meaningful check, usually `npm run lint` or a targeted build/type check when available.

## References

Load only the reference needed for the task:

- `references/architecture.md`: route structure, aliases, component boundaries, and service access rules.
- `references/ui-patterns.md`: shadcn/ui, Tailwind tokens, icons, responsive layout, and styling conventions.
- `references/data-realtime.md`: React Query, cursor pagination, Redux Toolkit state, SignalR, and API response shapes.

## Default rules

- Use `@/` imports for source modules.
- Use existing domain components and `src/components/ui` primitives before creating new UI primitives.
- Use `src/lib/axios.ts` and service modules for backend calls; do not create feature-local axios clients.
- Put `"use client"` only where client-only APIs, hooks, browser state, or event handlers are required.
- Keep API and realtime types explicit. Prefer updating `src/types` before using `any`.
- Preserve dark mode and responsive behavior when touching UI.
