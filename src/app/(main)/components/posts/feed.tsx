// components/posts/feed.tsx
"use client";

import { useHomeFeed } from "@/hooks/post/use-home-feed";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import PostCard from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";

export default function Feed() {
  const {
    posts,
    loadMore,
    isLoadingInitialData,
    hasMore: hasMoreFeed,
    isLoadingMore: isFeedLoadingMore,
  } = useHomeFeed();

  console.log("Feed render", { posts });

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px",
  });

  useEffect(() => {
    if (inView && hasMoreFeed && !isFeedLoadingMore) {
      loadMore();
    }
  }, [inView, hasMoreFeed, isFeedLoadingMore, loadMore]);

  console.log("render")

  return (
    <section className="">
      <div className="space-y-4">
        {isLoadingInitialData ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-xl bg-muted/20">
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id}>
              <PostCard post={post} />
            </div>
          ))
        )}
      </div>

      {hasMoreFeed && posts.length > 0 && (
        <>
          <div className="mt-4">
            {isFeedLoadingMore && <PostCardSkeleton />}
          </div>
          <div ref={loadMoreRef} className="flex w-full items-center justify-center py-6">
            {!isFeedLoadingMore && (
              <span className="text-muted-foreground/50 text-xs">
                Cuộn để xem thêm
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}