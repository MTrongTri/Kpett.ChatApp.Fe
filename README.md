# Kpett ChatApp Frontend

Frontend for **Kpett ChatApp**, a social networking and real-time chat application. The app lets users create profiles, publish media posts, interact with comments/reactions, manage friendships, receive notifications, and chat through direct or group conversations.

## Tech Stack

- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui, Radix UI, lucide-react, next-themes
- **Server state:** TanStack React Query
- **Client state:** Redux Toolkit, redux-persist
- **Realtime:** SignalR client
- **Forms & validation:** React Hook Form, Zod
- **Rich text:** Tiptap mention extension
- **HTTP client:** Axios with shared interceptors
- **Media UX:** Cloudinary signed upload flow, browser image compression, media lightbox
- **UI feedback:** Sonner toasts, Framer Motion, skeleton loading states

## Features

- Authentication screens for login, registration, logout, and account setup
- Access-token refresh handling through Axios interceptors and Next.js API proxy routes
- Route protection and session sync using cookies, Redux, and provider-level auth state
- Home feed with cursor pagination and infinite loading
- Post creation/editing modal with multi-step compose, media upload, privacy setting, and cache updates
- Post detail page, media slider, media lightbox, likes, comments, replies, and mention support
- User profile page, profile editing form, avatar/cover update UI, and username availability checking
- User search with infinite scrolling
- Friend request actions, friend suggestions, and profile interaction controls
- Realtime SignalR provider with automatic reconnect
- Direct and group chat UI with sidebar, full chat page, popup windows, and minimized chat bubbles
- Realtime messages, typing indicators, online presence, unread state, and read receipts
- Group creation and group member management UI
- Notification dropdown, unread count, realtime notification toasts, and cache invalidation
- Responsive layouts, dark mode, custom scrollbars, skeleton states, and global modal handling
- SEO metadata helpers, sitemap generation, and robots configuration for public pages

## Project Structure

```txt
src/
  app/                 Next.js App Router routes, layouts, metadata, API proxy routes
  components/          Reusable UI, auth, chat, post, comment, layout, provider components
  hooks/               Domain hooks for auth, chat, posts, comments, users, notifications
  lib/                 Axios client, utilities, SEO helpers, media/file helpers
  services/            API service layer grouped by domain
  store/               Redux Toolkit store and UI/auth slices
  types/               Shared TypeScript API and domain contracts
```

## Important Modules

- `src/lib/axios.ts` configures the shared Axios client, auth headers, normalized API errors, and token refresh retry flow.
- `src/components/providers/auth-provider.tsx` initializes auth state, refreshes tokens, and handles logout cleanup.
- `src/components/providers/signalr-provider.tsx` owns the SignalR connection and reconnect lifecycle.
- `src/hooks/chat/use-chat-realtime.ts` synchronizes realtime chat events with React Query and Redux popup state.
- `src/hooks/chat/use-chat-messages.ts` handles paginated messages, optimistic sending, read status, and cache updates.
- `src/components/posts/post-editor/post-editor.tsx` implements the create/edit post flow.
- `src/components/posts/post-editor/media-uploader.tsx` handles file validation, compression, signed Cloudinary upload, progress, cancellation, and deletion.
- `src/hooks/notification/use-notifications.tsx` handles notification pagination, unread counts, SignalR events, and toast rendering.

## Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Adjust values to match your backend and frontend URLs.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Available Scripts

```bash
npm run dev      # Start Next.js development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Backend Contract

This frontend expects a backend API exposed through:

```txt
{NEXT_PUBLIC_API_URL}/api
{NEXT_PUBLIC_API_URL}/hubs/app
```

The frontend service layer currently integrates these domains:

- `auth`
- `users`
- `posts`
- `comments`
- `relationships`
- `conversations`
- `notifications`
- `media`

## Notes

- Saved, Reels, and Friends standalone pages currently show "under development" placeholder screens.
- Post search is present in the search UI as a tab, but the implemented searchable flow in this frontend is user search.
- Frontend deployment target is not confirmed in this repository.
