export function PostCardSkeleton() {
  return (
    <article className="border-border bg-card rounded-xl border transition-all duration-200 relative overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
      {/* ── HEADER SKELETON ── */}
      <div className="flex items-start gap-3 p-4 pb-0">
        {/* Avatar Skeleton */}
        <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-full" />

        {/* Meta Skeleton */}
        <div className="flex flex-1 flex-col gap-2 py-1">
          {/* Username Skeleton */}
          <div className="bg-muted h-4 w-32 animate-pulse rounded-md" />
          {/* Time Skeleton */}
          <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
        </div>

        {/* More menu Skeleton (Icon button) */}
        <div className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded-lg" />
      </div>

      {/* ── TITLE & BODY SKELETON ── */}
      <div className="flex flex-col gap-2 px-4 pt-4 pb-3">
        {/* Title Skeleton */}
        <div className="bg-muted h-5 w-3/4 animate-pulse rounded-md" />

        {/* Body Lines Skeleton */}
        <div className="mt-1 flex flex-col gap-1.5">
          <div className="bg-muted h-4 w-full animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-[90%] animate-pulse rounded-md" />
          <div className="bg-muted h-4 w-1/2 animate-pulse rounded-md" />
        </div>
      </div>

      {/* ── IMAGE SKELETON ── */}
      <div className="mx-4 mb-3">
        {/* Dùng aspect-square hoặc h-100 tùy thuộc vào thiết kế gốc của bạn.
          Ở đây tôi giữ nguyên h-100 như trong component thật của bạn.
        */}
        <div className="border-border bg-muted h-100 w-full animate-pulse overflow-hidden rounded-xl border" />
      </div>

      {/* ── ACTIONS SKELETON ── */}
      <div className="flex items-center gap-1 px-3 py-2.5">
        {/* Like Button Skeleton */}
        <div className="bg-muted h-8 w-16 animate-pulse rounded-lg" />

        {/* Comment Button Skeleton */}
        <div className="bg-muted h-8 w-16 animate-pulse rounded-lg" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bookmark Button Skeleton */}
        <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />

        {/* Share Button Skeleton */}
        <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
      </div>
    </article>
  );
}
