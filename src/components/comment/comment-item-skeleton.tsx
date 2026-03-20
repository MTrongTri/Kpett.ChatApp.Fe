import { cn } from "@/lib/utils";

export const CommentItemSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex w-full gap-2.5", className)}>
      {/* ── AVATAR ── */}
      <div className="flex flex-col items-center">
        <div className="bg-muted h-8 w-8 shrink-0 animate-pulse rounded-full" />
      </div>

      {/* ── NỘI DUNG COMMENT ── */}
      <div className="flex-1 py-0.5">
        <div className="flex flex-wrap items-baseline gap-2">
          {/* Username Skeleton */}
          <div className="bg-muted h-3.5 w-20 animate-pulse rounded-sm" />

          {/* Nội dung dòng 1 Skeleton */}
          <div className="bg-muted h-3.5 w-40 animate-pulse rounded-sm" />
        </div>

        {/* Nội dung dòng 2 Skeleton (cho bình luận dài) */}
        <div className="bg-muted mt-1.5 h-3.5 w-[85%] animate-pulse rounded-sm" />

        {/* Info & Actions bar Skeleton */}
        <div className="mt-2 flex items-center gap-3">
          {/* Thời gian */}
          <div className="bg-muted h-2 w-8 animate-pulse rounded-sm" />
          {/* Nút Thích */}
          <div className="bg-muted h-2 w-10 animate-pulse rounded-sm" />
          {/* Nút Trả lời */}
          <div className="bg-muted h-2 w-12 animate-pulse rounded-sm" />
        </div>
      </div>
    </div>
  );
};
