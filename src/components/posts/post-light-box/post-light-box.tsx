"use client";

import { useRef } from "react";

import { Post } from "@/types/post";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

import { usePostDetail } from "@/hooks/post/use-post-detail";

import PostContent from "@/components/posts/post-content";
import CommentButton from "../comment-button";
import LikeButton from "../like-button";
import { PostHeader } from "../post-header";
import PostMediaSlider from "../post-media-slider";
import SaveButton from "../save-button";
import ShareButton from "../share-button";
import { PostLightboxSkeleton } from "./post-light-box-skeleton";
import { PostLightboxMenu } from "./post-lightbox-menu";

import PostCommentSection from "./post-comment-section";
import { usePostMenuActions } from "@/hooks/post/use-post-menu-actions";

interface PostLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  initialPost: Post | null;
  postId: string | null;
  autoScrollTarget: string | null;
}

export default function PostLightbox({
  isOpen,
  onClose,
  initialPost,
  postId,
  autoScrollTarget,
}: PostLightboxProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { post, isPostLoading, error: postError } = usePostDetail(postId, initialPost);

  const {
    handleEditClick,
    handleDelete,
    handleCopyLink
  } = usePostMenuActions(post || null);

  if (!isOpen) {
    return (
      <Dialog open={false} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="hidden" aria-describedby={undefined} />
      </Dialog>
    );
  }

  if (postError || (!post && !isPostLoading)) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="bg-card border-border flex max-h-[94vh] w-[92vw] flex-col items-center justify-center overflow-hidden rounded-lg md:max-w-235 md:rounded-2xl p-8 text-center"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Lỗi tải bài viết</DialogTitle>
          <div className="bg-destructive/10 text-destructive flex h-16 w-16 items-center justify-center rounded-full mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2 tracking-tight">
            Không tìm thấy bài viết
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            Bài viết này có thể đã bị xóa, bị ẩn, hoặc bạn không có quyền truy cập.
          </p>
          <Button onClick={onClose} className="w-full max-w-50 font-semibold">
            Đóng cửa sổ
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const isAuthor = post?.viewerContext.isOwner

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="bg-card border-border flex h-[100dvh] max-h-[100dvh] max-w-screen flex-col gap-0 overflow-hidden rounded-lg px-2 pt-[calc(env(safe-area-inset-top)+2rem)] pb-[calc(env(safe-area-inset-bottom)+1rem)] md:h-auto md:max-h-[94dvh] md:w-[92vw] md:max-w-235 md:rounded-2xl md:p-0"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Chi tiết bài viết</DialogTitle>

          {isPostLoading || !post ? (
            <PostLightboxSkeleton />
          ) : (
            <div className="flex flex-col h-full px-0 md:px-6 overflow-hidden min-w-0 w-full">
              <DialogHeader className="hidden md:block px-4 pr-6 py-2 shrink-0">
                <div className="flex w-full items-center justify-between border-b border-border">
                  <PostHeader
                    author={post.author}
                    postCreatedAt={post.createdAt}
                  />
                  <PostLightboxMenu
                    isAuthor={isAuthor}
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                    onCopyLink={handleCopyLink}
                  />
                </div>
              </DialogHeader>

              <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto flex flex-col min-w-0 w-full">
                <div className="hidden md:block px-4 py-3 shrink-0">
                  <PostContent content={post.content} tags={post.hashtags} />
                </div>

                <div className="hidden md:block shrink-0">
                  <PostMediaSlider media={post.media} />
                </div>

                <div className="flex items-center gap-1 px-3 py-2.5 shrink-0">
                  <LikeButton
                    postId={post.id}
                    initialLiked={post.viewerContext.isLiked ?? false}
                    initialLikeCount={post.metrics.likeCount}
                    initialReactionType={post.viewerContext.reactionType ?? null}
                  />

                  <CommentButton
                    commentCount={post.metrics.commentCount}
                    onClick={() => {
                      const target = document.getElementById("comment-list-area");
                      if (target) target.scrollIntoView({ behavior: "smooth" });
                    }}
                  />

                  <ShareButton postId={post.id} />

                  <div className="flex-1" />

                  <SaveButton
                    postId={post.id}
                    initialSaved={post.viewerContext.isSaved ?? false}
                  />
                </div>

                <PostCommentSection
                  post={post}
                  scrollContainerRef={scrollContainerRef}
                  autoScrollTarget={autoScrollTarget}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
