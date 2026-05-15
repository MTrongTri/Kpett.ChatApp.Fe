"use client";

import {
  EyeOff,
  Flag,
  Link2,
  MoreHorizontal,
  UserMinus
} from "lucide-react";

import CommentButton from "@/components/posts/comment-button";
import LikeButton from "@/components/posts/like-button";
import PostContent from "@/components/posts/post-content";
import { PostHeader } from "@/components/posts/post-header";
import PostMediaSlider from "@/components/posts/post-media-slider";
import SaveButton from "@/components/posts/save-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePostDetail } from "@/hooks/post/use-post-detail";
import type { Post } from "@/types/post";
import { PostCardSkeleton } from "../../../components/posts/post-card-skeleton";
import PostDetailComments from "./post-detail-comment";
import PostDetailError from "./post-detail-error";

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

  return (
    <div className="bg-background min-h-screen pt-14.5">
      <div className="mx-auto w-full max-w-240 px-0 py-0 md:px-4 md:py-5">
        <article className="bg-card border-border rounded-xl border transition-all duration-200">
          <div className="flex items-center justify-between gap-3 pt-1 pr-4">
            <div className="min-w-0 flex-1 px-3">
              <PostHeader author={post.author} postCreatedAt={post.createdAt} />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/40 hover:text-foreground hover:bg-foreground/8 h-8 w-8 shrink-0 rounded-lg"
                >
                  <MoreHorizontal size={15} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border text-card-foreground w-44 rounded-lg text-sm"
              >
                <DropdownMenuItem className="hover:text-primary focus:text-primary cursor-pointer gap-2">
                  <Link2 size={13} /> Sao chép liên kết
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <EyeOff size={13} /> Ẩn bài viết này
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <UserMinus size={13} /> Bỏ theo dõi
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer gap-2">
                  <Flag size={13} /> Báo cáo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="px-4 pb-3">
            <PostContent content={post.content} tags={post.hashtags} />
          </div>

          <PostMediaSlider media={post.media} />

          <div className="flex items-center gap-1 px-3 py-2.5">
            <LikeButton
              postId={post.id}
              initialLiked={post.viewerContext.isLiked ?? false}
              initialLikeCount={post.metrics.likeCount}
            />

            <CommentButton
              commentCount={post.metrics.commentCount}
              onClick={scrollToComments}
            />

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
