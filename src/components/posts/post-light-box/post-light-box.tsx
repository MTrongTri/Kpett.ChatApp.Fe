"use client";

import { useEffect, useRef } from "react";
import { CommentInput } from "@/components/comment/comment-input";
import { CommentList } from "@/components/comment/comment-list";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { getUserMentions } from "@/services/user.service";
import { Post } from "@/types/post";
import { Comment } from "@/types/comment";
import { PostActions } from "./post-actions";
import { PostCaption } from "./post-caption";
import { PostHeader } from "./post-header";
import { PostMediaCarousel } from "./post-media-carousel";
import { Loader2, X } from "lucide-react";
import { PostLightboxSkeleton } from "./post-light-box-skeleton";
import { useInView } from "react-intersection-observer";
import { time } from "console";
import { CommentItemSkeleton } from "@/components/comment/comment-item-skeleton";
import { MediaLightbox } from "../media-lightbox";
import { useMediaLightbox } from "@/hooks/use-media-lightbox";

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
}: PostLightboxProps) {
  // Tham chiếu (Ref) đến thẻ div cuối cùng để kích hoạt cuộn
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  // Logic tự động gọi onLoadMore khi thẻ loadMoreRef xuất hiện trên màn hình
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
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [autoScrollTarget, isPostLoading]);

  const fetchMentions = async (query: string) => {
    try {
      const response = await getUserMentions(query);
      if (response.return && response.data) return response.data;
      return [];
    } catch (error) {
      console.error("Lỗi tải mention:", error);
      return [];
    }
  };

  const debouncedFetchMentions = useDebounceCallback(fetchMentions, 300);

  const handleAddComment = async (content: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Thêm bình luận:", content);
    // TODO: Gọi API thêm bình luận và mutate(update) lại cache của SWR
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-card border-border flex max-h-[94vh] w-[92vw] flex-col gap-0 overflow-hidden rounded-lg md:max-w-235 md:rounded-2xl"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Chi tiết bài viết</DialogTitle>
        {/* Nút đóng */}
        <DialogClose className="absolute top-4 right-4 z-60 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
          <X className="h-6 w-6" />
        </DialogClose>

        {/* Trạng thái Loading toàn bộ bài viết */}
        {isPostLoading || !post ? (
          <PostLightboxSkeleton />
        ) : (
          <>
            <DialogHeader className="px-4">
              <PostHeader author={post.author} postCreatedAt={post.createdAt} />
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <PostCaption content={post.content} hashtags={post.hashtags} />
              <PostMediaCarousel media={post.media} postId={post.id} />
              <PostActions metrics={post.metrics} />

              <p className="text-foreground/60 mb-3 text-[12px] font-semibold">
                {post.metrics.commentCount} Bình luận
              </p>

              {/* Danh sách bình luận */}
              <div id="comment-list-area">
                {/* Trạng thái Loading bình luận lần đầu */}
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

              {/* Thẻ theo dõi cuộn (Sentinel) để Trigger tải thêm */}
              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                  {isLoadingMore ? (
                    <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      Cuộn để xem thêm
                    </span>
                  )}
                </div>
              )}

              {/* Thông báo hết bình luận */}
              {!hasMore && comments.length > 0 && (
                <p className="text-muted-foreground/50 py-4 text-center text-xs">
                  Đã tải hết bình luận
                </p>
              )}
            </div>

            <div className="border-border/50 border-t px-4 pt-4 pb-4">
              <CommentInput
                author={post.author}
                fetchMentions={debouncedFetchMentions}
                onSubmit={handleAddComment}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
