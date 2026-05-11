"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { openPostLightBox } from "@/store/features/modal-slice";
import type { Post } from "@/types/post";
import {
  EyeOff,
  Flag,
  Link2,
  MoreHorizontal,
  UserMinus
} from "lucide-react";
import { useDispatch } from "react-redux";

import CommentButton from "@/components/posts/comment-button";
import LikeButton from "@/components/posts/like-button";
import PostContent from "@/components/posts/post-content";
import { PostHeader } from "@/components/posts/post-header";
import PostMediaSlider from "@/components/posts/post-media-slider";
import SaveButton from "@/components/posts/save-button";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const dispatch = useDispatch();

  const handleOpenLightBox = () => {
    dispatch(openPostLightBox({ postId: post.id, post, targetScroll: "comment-list-area" }));
  };

  return (
    <article className="border-border bg-card rounded-xl border transition-all duration-200">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between gap-3 pr-4 pt-1">
        <div className="flex-1 min-w-0 px-3">
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

      {/* ── TITLE & BODY ── */}
      <div className="px-4 pb-3">
        <PostContent content={post.content} tags={post.hashtags} />
      </div>

      {/* ── IMAGE / MEDIA SLIDER ── */}
      <PostMediaSlider
        media={post.media}
      />

      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-1 px-3 py-2.5">

        {/* Nút Like */}
        <LikeButton
          postId={post.id}
          initialLiked={post.viewerContext.isLiked ?? false}
          initialLikeCount={post.metrics.likeCount}
        />

        {/* Nút Comment */}
        <CommentButton
          commentCount={post.metrics.commentCount}
          onClick={handleOpenLightBox}
        />

        <div className="flex-1" />

        {/* Nút Save */}
        <SaveButton
          postId={post.id}
          initialSaved={post.viewerContext.isSaved ?? false}
        />

      </div>
    </article>
  );
}