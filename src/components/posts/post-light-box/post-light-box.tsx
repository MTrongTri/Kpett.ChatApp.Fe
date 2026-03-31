"use client";

import PostContent from "@/app/(main)/components/posts/post-content";
import { CommentInput } from "@/components/comment/comment-input";
import { CommentItemSkeleton } from "@/components/comment/comment-item-skeleton";
import { CommentList } from "@/components/comment/comment-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { getUserMentions } from "@/services/user.service";
import { RootState } from "@/store/store";
import { Comment } from "@/types/comment";
import { Post } from "@/types/post";
import { EyeOff, Flag, Link2, MoreHorizontal, Pencil, UserMinus } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useSelector } from "react-redux";
import PostModal from "../modal-post/post-modal";
import { PostActions } from "./post-actions";
import { PostHeader } from "./post-header";
import { PostLightboxSkeleton } from "./post-light-box-skeleton";
import { PostMediaCarousel } from "./post-media-carousel";

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
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // State cho PostModal ---
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalMode, setPostModalMode] = useState<"create" | "edit">("edit");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

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
      if (response.isSuccess && response.data) return response.data;
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

  // Hàm xử lý khi click "Chỉnh sửa" ---
  const handleEditClick = () => {
    if (post) {
      setPostModalMode("edit");
      setSelectedPostId(post.id);
      setIsPostModalOpen(true);
    }
  };

  // Kiểm tra xem người dùng hiện tại có phải là tác giả của bài viết không
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
                <div className="flex w-full items-center justify-between">
                  <PostHeader
                    author={post.author}
                    postCreatedAt={post.createdAt}
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground/40 hover:bg-foreground/8 hover:text-foreground h-8 w-8 shrink-0 rounded-lg"
                      >
                        <MoreHorizontal size={15} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-card border-border text-[12px] text-card-foreground/80 w-44 rounded-lg space-y-1"
                    >
                      {/* --- 6. Nút Chỉnh sửa chỉ hiện khi là tác giả --- */}
                      {isAuthor && (
                        <DropdownMenuItem
                          className="hover:text-primary focus:text-primary cursor-pointer gap-2"
                          onClick={handleEditClick}
                        >
                          <Pencil size={13} /> Chỉnh sửa bài viết
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem className="hover:text-primary focus:text-primary cursor-pointer gap-2">
                        <Link2 size={13} /> Sao chép liên kết
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <EyeOff size={13} /> Ẩn bài viết
                      </DropdownMenuItem>

                      {/* Nút Bỏ theo dõi thường không hiện nếu đây là bài của chính mình */}
                      {!isAuthor && (
                        <DropdownMenuItem className="cursor-pointer gap-2">
                          <UserMinus size={13} /> Bỏ theo dõi
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer gap-2">
                        <Flag size={13} /> Báo cáo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </DialogHeader>

              {/* ... (Phần thân Dialog giữ nguyên như cũ) ... */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                <PostContent content={post.content} tags={post.hashtags} />
                <PostMediaCarousel media={post.media} postId={post.id} />
                <PostActions metrics={post.metrics} />

                <p className="text-foreground/60 mb-3 text-[12px] font-semibold">
                  {post.metrics.commentCount} Bình luận
                </p>

                <div id="comment-list-area">
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