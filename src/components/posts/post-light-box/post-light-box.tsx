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
import { addComment } from "@/services/comment.service";
import { toast } from "sonner";
import { useSWRConfig } from "swr"; // 🚀 Import SWR Config để dùng globalMutate

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

  // Lấy globalMutate để cập nhật Cache toàn cục
  const { mutate: globalMutate } = useSWRConfig();

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postModalMode, setPostModalMode] = useState<"create" | "edit">("edit");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

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
    if (post != null) {
      const res = await addComment(post.id, content, null);

      if (res.isSuccess && res.data) {
        const newComment = res.data;

        // 1. GHI ĐÈ TRỰC TIẾP VÀO CACHE BẰNG HÀM MUTATE LOCAL (Cực kỳ an toàn)
        mutateComments(
          (currentData: any) => {
            if (!currentData || currentData.length === 0) {
              return [{
                data: { items: [newComment], pagination: { hasMore: false, nextCursor: null } },
                isSuccess: true
              }];
            }

            const newPages = [...currentData];
            const lastPageIndex = newPages.length - 1; // Thêm vào trang cuối

            newPages[lastPageIndex] = {
              ...newPages[lastPageIndex],
              data: {
                ...newPages[lastPageIndex].data,
                // Chèn comment mới xuống cuối danh sách
                items: [...(newPages[lastPageIndex].data?.items || []), newComment],
              },
            };
            return newPages;
          },
          { revalidate: false }
        );

        // 2. TĂNG SỐ LƯỢNG COMMENT COUNT CHO BÀI VIẾT BÊN NGOÀI FEED
        globalMutate(
          (key: any) => Array.isArray(key), // Quét tất cả các key là Array
          (currentData: any) => {
            if (!currentData) return currentData;

            // Xử lý nếu Feed đang dùng useSWRInfinite
            if (Array.isArray(currentData)) {
              return currentData.map((page: any) => {
                if (!page?.data?.items || !Array.isArray(page.data.items)) return page;
                return {
                  ...page,
                  data: {
                    ...page.data,
                    items: page.data.items.map((p: any) => {
                      if (p.id === post.id && p.metrics) {
                        return { ...p, metrics: { ...p.metrics, commentCount: p.metrics.commentCount + 1 } };
                      }
                      return p;
                    })
                  }
                };
              });
            }

            // Xử lý nếu là bài Post chi tiết (dùng useSWR)
            if (currentData?.data?.id === post.id && currentData?.data?.metrics) {
              return {
                ...currentData,
                data: {
                  ...currentData.data,
                  metrics: { ...currentData.data.metrics, commentCount: currentData.data.metrics.commentCount + 1 }
                }
              };
            }
            return currentData;
          },
          { revalidate: false }
        );

        toast.success("Thêm bình luận thành công");

        // 3. Cuộn mượt mà xuống cuối để user thấy comment vừa thêm
        setTimeout(() => {
          const scrollContainer = document.querySelector('.overflow-y-auto');
          if (scrollContainer) {
            scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
          }
        }, 150);

      } else {
        toast.error("Đã có lỗi xảy ra");
      }
    } else {
      toast.error("Không tìm thấy bài viết");
    }
  };

  const handleEditClick = () => {
    if (post) {
      setPostModalMode("edit");
      setSelectedPostId(post.id);
      setIsPostModalOpen(true);
    }
  };

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