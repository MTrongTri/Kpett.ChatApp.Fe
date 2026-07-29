"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bookmark, Loader2, ImageIcon, FileText } from "lucide-react";
import { useSavedPosts } from "@/hooks/post/use-saved-posts";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { PostThumbnail } from "@/types/post";

function SavedPostCard({ post }: { post: PostThumbnail }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {post.mediaThumbnail ? (
          post.mediaThumbnail.type === "video" ? (
            <div className="flex h-full items-center justify-center bg-black/5">
              <ImageIcon className="h-12 w-12 text-muted-foreground/40" strokeWidth={1} />
            </div>
          ) : (
            <img
              src={post.mediaThumbnail.url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground/30" strokeWidth={1} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-3">
        <UserAvatar
          user={{
            id: post.author.id,
            username: post.author.username,
            displayName: post.author.displayName,
            avatarUrl: post.author.avatarUrl,
          }}
          className="h-9 w-9 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {post.author.displayName || post.author.username}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <span>{(post.metrics?.likeCount ?? 0).toLocaleString("vi-VN")} ❤</span>
          <span>{(post.metrics?.commentCount ?? 0).toLocaleString("vi-VN")} 💬</span>
        </div>
      </div>
    </Link>
  );
}

function SavedSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SavedPage() {
  const { posts, isLoadingInitialData, isLoadingMore, hasMore, loadMore } = useSavedPosts();
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoadingMore, loadMore]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-2.5 text-primary">
          <Bookmark className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Bài viết đã lưu</h1>
          <p className="text-sm text-muted-foreground">Tất cả bài viết bạn đã lưu</p>
        </div>
      </div>

      {isLoadingInitialData ? (
        <SavedSkeleton />
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-5">
            <Bookmark className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold mb-1">Chưa có bài viết nào</h2>
          <p className="max-w-sm text-sm text-muted-foreground mb-6">
            Khi bạn lưu bài viết, chúng sẽ xuất hiện ở đây để bạn xem lại sau.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/">Khám phá bài viết</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <SavedPostCard key={post.id} post={post} />
            ))}
          </div>

          {hasMore && (
            <div ref={ref} className="mt-8 flex justify-center">
              {isLoadingMore ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <p className="text-sm text-muted-foreground">Cuộn để xem thêm...</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
