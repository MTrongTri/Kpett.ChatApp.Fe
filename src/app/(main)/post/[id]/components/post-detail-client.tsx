"use client";

import CommentButton from "@/components/posts/comment-button";
import LikeButton from "@/components/posts/like-button";
import PostContent from "@/components/posts/post-content";
import { PostHeader } from "@/components/posts/post-header";
import PostMediaSlider from "@/components/posts/post-media-slider";
import SaveButton from "@/components/posts/save-button";
import ShareButton from "@/components/posts/share-button";
import { usePostDetail } from "@/hooks/post/use-post-detail";
import type { Post } from "@/types/post";
import { PostCardSkeleton } from "../../../components/posts/post-card-skeleton";
import PostDetailComments from "./post-detail-comment";
import PostDetailError from "./post-detail-error";
import { DialogHeader } from "@/components/ui/dialog";
import { usePostMenuActions } from "@/hooks/post/use-post-menu-actions";
import { PostLightboxMenu } from "@/components/posts/post-light-box/post-lightbox-menu";

type PostDetailClientProps = {
  initialPost: Post | null;
  postId: string;
};

export default function PostDetailClient({
  initialPost,
  postId,
}: PostDetailClientProps) {
  const { post, isPostLoading, error } = usePostDetail(postId, initialPost, {
    refetchOnMount: false,
    staleTime: 120 * 1000,
  });

  const { handleEditClick, handleDelete, handleCopyLink } = usePostMenuActions(post ?? null);

  const scrollToComments = () => {
    document
      .getElementById("comment-list-area")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isPostLoading) {
    return (
      <div className="bg-background min-h-screen pt-14.5">
        <div className="mx-auto w-full max-w-240 px-0 py-0 md:px-4 md:py-5">
          <PostCardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return <PostDetailError />;
  }

  const isAuthor = post.viewerContext.isOwner

  return (
    <div className="bg-background min-h-screen pt-14.5">
      <div className="mx-auto w-full h-screen max-w-240 px-0 py-0 md:px-4 md:py-5">
        <article className="h-screen bg-card border-border rounded-xl border transition-all duration-200">
          <DialogHeader className="px-4 pr-6 py-2 shrink-0">
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

          <div className="px-4 pb-3">
            <PostContent content={post.content} tags={post.hashtags} />
          </div>

          <PostMediaSlider media={post.media} />

          <div className="flex items-center gap-1 px-3 py-2.5">
            <LikeButton
              postId={post.id}
              initialLiked={post.viewerContext.isLiked ?? false}
              initialLikeCount={post.metrics.likeCount}
              initialReactionType={post.viewerContext.reactionType ?? null}
            />

            <CommentButton
              commentCount={post.metrics.commentCount}
              onClick={scrollToComments}
            />

            <ShareButton postId={post.id} />

            <div className="flex-1" />

            <SaveButton
              postId={post.id}
              initialSaved={post.viewerContext.isSaved ?? false}
            />
          </div>

          <PostDetailComments post={post} />
        </article>
      </div>
    </div>
  );
}
