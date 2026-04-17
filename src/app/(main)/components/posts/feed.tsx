"use client";

import { MediaLightbox } from "@/components/posts/media-lightbox";
import PostLightbox from "@/components/posts/post-light-box/post-light-box";
import { useHomeFeed } from "@/hooks/post/use-home-feed";
import { useMediaLightbox } from "@/hooks/post/use-media-lightbox";
import { usePostLightBox } from "@/hooks/post/use-post-light-box";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import PostCard from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function Feed() {
  const {
    posts,
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

  const {
    isOpen,
    autoScrollTarget,
    isPostLoading,
    isCommentsLoading,
    post,
    comments,
    isLoadingMore,
    hasMore,
    loadMoreComments,
    openModal,
    closeModal,
    mutateComments
  } = usePostLightBox();

  const {
    isOpen: isOpenMediaLightBox,
    media,
    currentIndex,
    openLightbox: openMediaLightBox,
    handleOpenChange,
  } = useMediaLightbox();

  return (
    <section className="">
      <div className="space-y-4">
        {isLoadingInitialData ? (
          <>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </>
        ) : (
          posts.map((post, i) => (
            <div key={post.id} className="">
              <PostCard
                post={post}
                onOpenPostLightBox={openModal}
                openMediaLightBox={openMediaLightBox}
              />
            </div>
          ))
        )}
      </div>

      {/* Load more */}
      {hasMoreFeed && (
        <>
          <div className="mt-4">
            {isFeedLoadingMore && <PostCardSkeleton />}
          </div>
          <div
            ref={loadMoreRef}
            className="flex w-full items-center justify-center py-6"
          >
            {!isFeedLoadingMore && (
              <span className="text-muted-foreground/50 text-xs">
                Cuộn để xem thêm
              </span>
            )}
          </div>
        </>
      )}

      {isOpen && (
        <PostLightbox
          isOpen={isOpen}
          onClose={closeModal}
          post={post}
          comments={comments}
          autoScrollTarget={autoScrollTarget}
          isPostLoading={isPostLoading}
          isCommentsLoading={isCommentsLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreComments}
          mutateComments={mutateComments}
        />
      )}

      <MediaLightbox
        isOpen={isOpenMediaLightBox}
        onOpenChange={handleOpenChange}
        media={media}
        initialIndex={currentIndex}
        className="top-0 right-0 bottom-0 left-0 flex h-screen max-w-none! translate-x-0 translate-y-0"
      />
    </section>
  );
}
