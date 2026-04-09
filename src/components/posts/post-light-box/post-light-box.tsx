"use client";

import PostContent from "@/app/(main)/components/posts/post-content";
import { CommentInput } from "@/components/comment/comment-input";
import { CommentItemSkeleton } from "@/components/comment/comment-item-skeleton";
import { CommentList } from "@/components/comment/comment-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { RootState } from "@/store/store";
import { Comment } from "@/types/comment";
import { Post } from "@/types/post";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useSelector } from "react-redux";

import PostModal from "../modal-post/post-modal";
import { PostActions } from "./post-actions";
import { PostHeader } from "./post-header";
import { PostLightboxSkeleton } from "./post-light-box-skeleton";
import { PostLightboxMenu } from "./post-lightbox-menu";
import { PostMediaCarousel } from "./post-media-carousel";

import { usePostActions } from "@/hooks/post/use-post-actions";
import { useCreateComment } from "@/hooks/use-create-comment";

interface PostLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null | undefined;
  comments: Comment[];
  autoScrollTarget: string | null;
  isPostLoading: boolean;
  isCommentsLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  mutateComments: (data?: any, opts?: any) => Promise<any>;
}

export default function PostLightbox({
  isOpen,
  onClose,
  post,
  comments,
  autoScrollTarget,
  isPostLoading,
  isCommentsLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  mutateComments
}: PostLightboxProps) {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    if (autoScrollTarget && !isPostLoading) {
      const timer = setTimeout(() => {
        const target = document.getElementById(autoScrollTarget);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [autoScrollTarget, isPostLoading]);

  const {
    handleEditClick,
    handleDelete,
    fetchMentions,
    isPostModalOpen,
    setIsPostModalOpen,
    postModalMode,
    selectedPostId
  } = usePostActions(post, onClose);

  const debouncedFetchMentions = useDebounceCallback(fetchMentions, 300);

  const { handleAddComment } = useCreateComment({
    post: post || null,
    localMutate: mutateComments,
    onSuccess: () => {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  });

  const isAuthor = currentUser?.id === post?.author?.id;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="bg-card border-border flex max-h-[94vh] w-[92vw] flex-col gap-0 overflow-hidden rounded-lg md:max-w-235 md:rounded-2xl"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Chi tiết bài viết</DialogTitle>

          {isPostLoading || !post ? (
            <PostLightboxSkeleton />
          ) : (
            <>
              <DialogHeader className="px-4 py-2">
                <div className="flex w-full items-center justify-between border-b border-border">
                  <PostHeader
                    author={post.author}
                    postCreatedAt={post.createdAt}
                  />

                  <PostLightboxMenu isAuthor={isAuthor} onEdit={handleEditClick} onDelete={handleDelete} />
                </div>
              </DialogHeader>

              <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                <PostContent content={post.content} tags={post.hashtags} />
                <PostMediaCarousel media={post.media} postId={post.id} />
                <PostActions metrics={post.metrics} />

                <p id="comment-list-area" className="text-foreground/60 mb-3 text-[12px] font-semibold">
                  {post.metrics.commentCount} Bình luận
                </p>

                <div>
                  {isCommentsLoading && comments.length === 0 ? (
                    <>
                      <CommentItemSkeleton />
                      <CommentItemSkeleton />
                      <CommentItemSkeleton />
                    </>
                  ) : (
                    <CommentList postId={post.id} comments={comments} />
                  )}
                </div>

                {hasMore && isLoadingMore && (
                  <div className="mt-3 space-y-3">
                    <CommentItemSkeleton />
                    <CommentItemSkeleton />
                    <CommentItemSkeleton />
                  </div>
                )}

                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-4">
                    {!isLoadingMore && (
                      <span className="text-muted-foreground text-xs">
                        Cuộn để xem thêm
                      </span>
                    )}
                  </div>
                )}

                {!hasMore && comments.length > 0 && (
                  <p className="text-muted-foreground/50 py-4 text-center text-xs">
                    Đã tải hết bình luận
                  </p>
                )}
              </div>

              <div className="border-border/50 border-t px-4 pt-4 pb-4">
                <CommentInput
                  author={currentUser!}
                  fetchMentions={debouncedFetchMentions}
                  onSubmit={handleAddComment}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PostModal
        open={isPostModalOpen}
        onOpenChange={setIsPostModalOpen}
        mode={postModalMode}
        postId={selectedPostId}
      />
    </>
  );
}