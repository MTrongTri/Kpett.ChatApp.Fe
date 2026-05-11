export function PostLightboxSkeleton() {
  return (
    <div className="bg-card flex h-full w-full flex-col">
      {/* ── HEADER SKELETON ── */}
      <div className="border-border flex shrink-0 items-center gap-2.5 border-b px-4 py-3">
        <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />{" "}
        {/* Avatar */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="bg-muted h-4 w-28 animate-pulse rounded-md" />{" "}
          {/* Username */}
          <div className="bg-muted h-3 w-16 animate-pulse rounded-md" />{" "}
          {/* Subtitle/Time */}
        </div>
        <div className="bg-muted h-6 w-14 animate-pulse rounded-md" />{" "}
        {/* Follow button */}
      </div>

      {/* ── INFO PANEL SKELETON ── */}
      <div className="min-h-0 flex-1 space-y-4 overflow-hidden px-4 py-3">
        {/* Caption */}
        <div className="space-y-2">
          <div className="bg-muted h-3.5 w-full animate-pulse rounded-md" />
          <div className="bg-muted h-3.5 w-[90%] animate-pulse rounded-md" />
          <div className="bg-muted h-3.5 w-[60%] animate-pulse rounded-md" />
          {/* Hashtags */}
          <div className="mt-2 flex gap-1.5">
            <div className="bg-muted h-4 w-12 animate-pulse rounded-sm" />
            <div className="bg-muted h-4 w-16 animate-pulse rounded-sm" />
            <div className="bg-muted h-4 w-10 animate-pulse rounded-sm" />
          </div>
        </div>

        {/* Media Block  */}
        <div className="bg-muted h-75 w-full animate-pulse rounded-xl md:h-100" />

        {/* Actions (Like, Comment, Save, Share) */}
        <div className="my-3 flex items-center gap-1.5">
          <div className="bg-muted h-8 w-16 animate-pulse rounded-lg" />
          <div className="bg-muted h-8 w-16 animate-pulse rounded-lg" />
          <div className="flex-1" />
          <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
          <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
        </div>
      </div>

      {/* ── COMMENT INPUT SKELETON ── */}
      <div className="border-border/50 mt-auto border-t px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded-full" />
          <div className="bg-muted h-10 flex-1 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
