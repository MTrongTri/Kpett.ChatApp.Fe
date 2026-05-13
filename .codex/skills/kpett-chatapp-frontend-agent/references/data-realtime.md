# Data And Realtime

Use this reference when changing services, hooks, cache updates, authentication state, chat, notifications, or realtime behavior.

## API response shapes

Shared API types live in `src/types/common/api.ts`:

```ts
export interface ApiResponse<T = any> {
  isSuccess: boolean;
  message: string;
  data?: T;
  statusCode: number;
  errorCode?: string;
}

export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
  limit: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: CursorPaginationMeta;
}
```

- Services usually return `response.data` because `src/lib/axios.ts` unwraps the backend `ApiResponse`.
- Cursor-based list features should use `PaginatedData<T>` and `pagination.nextCursor`.
- Keep backend DTO/model types in the relevant file under `src/types`.

## React Query

- Use React Query for server state, lists, mutations, and cache synchronization.
- Use stable query keys that match existing domain patterns, for example `["conversations"]` and `["chat-messages", conversationId]`.
- Use infinite queries for cursor-paginated endpoints.
- Update cache with `queryClient.setQueryData` for optimistic UI or realtime events when nearby code already does so.
- Use `immer` for complex nested cache updates when the existing hook uses it.

## Redux state

- Use Redux Toolkit for app UI/auth state that must be shared outside a single server-state query.
- Store configuration lives in `src/store/store.ts`.
- Current persisted auth state blacklists `accessToken`; do not persist access tokens unless the auth design changes explicitly.
- Add feature slices only for durable cross-component UI state, not for backend collections that belong in React Query.

## Auth and axios

- Backend HTTP calls should go through `src/lib/axios.ts`.
- Preserve request interceptor behavior that reads the access token from Redux and adds `Authorization`.
- Preserve refresh behavior for `AUTH.ACCESS_TOKEN_INVALID`.
- Use `authHttp` only for local `/api/auth` routes.

## SignalR

- Use `SignalRProvider` and `useSignalR` from `src/components/providers/signalr-provider.tsx`.
- Do not create separate SignalR connections inside feature components or hooks.
- Register event handlers inside effects and always unregister them in cleanup.
- Keep realtime updates synchronized with React Query cache and service calls such as mark-as-read.
- Preserve automatic reconnect behavior from the provider.
