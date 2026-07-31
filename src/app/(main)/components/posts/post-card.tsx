"use client";

import { useState } from "react";
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
  Trash2,
  UserMinus,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "@/services/post.service";

import CommentButton from "@/components/posts/comment-button";
import LikeButton from "@/components/posts/like-button";
import ShareButton from "@/components/posts/share-button";
import PostContent from "@/components/posts/post-content";
import { PostHeader } from "@/components/posts/post-header";
import PostMediaSlider from "@/components/posts/post-media-slider";
import SaveButton from "@/components/posts/save-button";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showNsfw, setShowNsfw] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts-profile"] });
      toast.success("Đã xóa bài viết.");
    },
    onError: () => toast.error("Không thể xóa bài viết."),
  });

  const handleOpenLightBox = () => {
    dispatch(openPostLightBox({ postId: post.id, post, targetScroll: "comment-list-area" }));
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    const isSuccess = await copyToClipboard(url);
    if (isSuccess) {
      toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
    } else {
      toast.error("Không thể sao chép. Vui lòng thử lại.");
    }
  };

  return (
    <article className="border-0 md:border-border bg-card rounded-xl md:border transition-all duration-200 relative hover:shadow-md hover:-translate-y-0.5">
      {/* ── DELETE CONFIRM ── */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm p-6">
          <div className="bg-destructive/20 p-3 rounded-full mb-3">
            <Trash2 className="text-destructive h-8 w-8" />
          </div>
          <h3 className="text-white text-lg font-bold mb-1">Xóa bài viết?</h3>
          <p className="text-white/70 text-sm text-center max-w-xs mb-4">
            Bài viết này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3">
            <Button
              variant="destructive"
              size="sm"
              className="rounded-full"
              disabled={isDeleting}
              onClick={() => handleDelete()}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/20 text-white hover:text-white hover:bg-white/10"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}

      {/* ── NSFW OVERLAY ── */}
      {post.isNsfw && !showNsfw && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-destructive/20 p-4 rounded-full mb-4">
            <AlertTriangle className="text-destructive h-10 w-10" />
          </div>
          <h3 className="text-white text-lg font-bold mb-2">Nội dung nhạy cảm</h3>
          <p className="text-white/70 text-sm text-center max-w-xs mb-6">
            Bài viết này có chứa nội dung dành cho người trên 18 tuổi. Bạn cần xác nhận để xem.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full border-white/20 text-white hover:text-white hover:bg-white/10"
              onClick={() => setShowNsfw(true)}
            >
              <Eye size={16} className="mr-2" />
              Xem bài viết
            </Button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className={cn("flex items-start justify-between gap-3 pr-4 pt-1", post.isNsfw && !showNsfw && "blur-sm select-none pointer-events-none")}>
        <div className="flex-1 min-w-0 px-3">
          <PostHeader author={post.author} postCreatedAt={post.createdAt} group={post.group} />
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
            <DropdownMenuItem onClick={handleCopyLink} className="hover:text-primary focus:text-primary cursor-pointer gap-2">
              <Link2 size={13} /> Sao chép liên kết
            </DropdownMenuItem>
            {post.viewerContext.canDelete && (
              <>
                <div className="h-px bg-border mx-2" />
                <DropdownMenuItem
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-destructive hover:text-destructive focus:text-destructive cursor-pointer gap-2"
                >
                  <Trash2 size={13} /> Xóa bài viết
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── TITLE & BODY ── */}
      <div className={cn("px-4 pb-3", post.isNsfw && !showNsfw && "blur-sm select-none pointer-events-none")}>
        <PostContent content={post.content} tags={post.hashtags} isNsfw={post.isNsfw} showNsfwContent={showNsfw} />
      </div>

      {/* ── IMAGE / MEDIA SLIDER ── */}
      <PostMediaSlider
        media={post.media}
        isNsfw={post.isNsfw}
        showNsfwContent={showNsfw}
      />

      {/* ── ACTIONS ── */}
      {post.status === "pending" ? (
        <div className={cn("px-4 py-3 bg-amber-500/10 border-t border-amber-500/20 text-amber-600 text-sm font-medium flex items-center justify-center gap-2 rounded-b-xl", post.isNsfw && !showNsfw && "blur-sm select-none pointer-events-none")}>
          Bài viết đang chờ quản trị viên phê duyệt
        </div>
      ) : (
        <div className={cn("flex items-center gap-1 px-3 py-2.5", post.isNsfw && !showNsfw && "blur-sm select-none pointer-events-none")}>
          <LikeButton postId={post.id} initialLiked={post.viewerContext.isLiked ?? false} initialLikeCount={post.metrics.likeCount} initialReactionType={post.viewerContext.reactionType ?? null} />
          <CommentButton commentCount={post.metrics.commentCount} onClick={handleOpenLightBox} />
          <ShareButton postId={post.id} />
          <div className="flex-1" />
          <SaveButton postId={post.id} initialSaved={post.viewerContext.isSaved ?? false} />
        </div>
      )}
    </article>
  );
}
