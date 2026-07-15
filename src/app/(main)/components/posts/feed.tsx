"use client";

import { useHomeFeed } from "@/hooks/post/use-home-feed";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import PostCard from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";

export default function Feed() {
  const {
    posts,
    error,
    loadMore,
    isLoadingInitialData,
    hasMore: hasMoreFeed,
    isLoadingMore: isFeedLoadingMore,
  } = useHomeFeed();

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px",
  });

  useEffect(() => {
    if (inView && hasMoreFeed && !isFeedLoadingMore) {
      loadMore();
    }
  }, [inView, hasMoreFeed, isFeedLoadingMore, loadMore]);

  return (
    <section>
      <div className="space-y-4">
        {isLoadingInitialData ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-destructive/10 px-4 py-20 text-center">
            <h3 className="text-base font-semibold text-destructive">
              Không thể tải bài viết
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Đã có lỗi xảy ra trong quá trình tải bảng tin. Vui lòng thử lại
              sau.
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-muted/20 px-4 py-20 text-center">
            <h3 className="text-base font-semibold">
              Chưa có bài viết nào
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Hiện tại bảng tin của bạn chưa có nội dung. Hãy theo dõi thêm
              người dùng khác hoặc quay lại sau.
            </p>
          </div>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
            >
              <PostCard post={post} />
            </motion.div>
          ))
        )}
      </div>

      {!error && hasMoreFeed && posts.length > 0 && (
        <>
          <div className="mt-4">
            {isFeedLoadingMore && <PostCardSkeleton />}
          </div>

          <div
            ref={loadMoreRef}
            className="flex w-full items-center justify-center py-6"
          >
            {!isFeedLoadingMore && (
              <span className="text-xs text-muted-foreground/50">
                Cuộn để xem thêm
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}