import { CommentItemSkeleton } from "@/components/comment/comment-item-skeleton";
import { PostCardSkeleton } from "../../components/posts/post-card-skeleton";

export default function PostDetailLoading() {
  return (
    <div className="bg-background min-h-screen pt-14.5">
      <div className="mx-auto w-full max-w-240 px-0 py-0 md:px-4 md:py-5">
        <PostCardSkeleton />

        <section className="bg-card border-border mt-4 rounded-xl border px-4 py-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="bg-muted h-4 w-24 animate-pulse rounded-md" />
              <div className="bg-muted/70 h-3 w-52 animate-pulse rounded-md" />
            </div>
            <div className="bg-muted h-6 w-10 animate-pulse rounded-full" />
          </div>

          <div className="max-h-[56vh] space-y-3 overflow-hidden pr-1">
            <CommentItemSkeleton />
            <CommentItemSkeleton />
            <CommentItemSkeleton />
          </div>

          <div className="mt-5 pt-4">
            <div className="border-border bg-muted/30 h-11 animate-pulse rounded-xl border" />
          </div>
        </section>
      </div>
    </div>
  );
}
