"use client";

import { useDebounceCallback } from "@/hooks/use-debounce";
import { useReplies } from "@/hooks/use-replies";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { addComment } from "@/services/comment.service";
import { getUserMentions } from "@/services/user.service";
import { Comment } from "@/types/comment";
import Link from "next/link";
import { memo, useCallback, useState } from "react";
import { UserAvatar } from "../user/user-avatar";
import { CommentInput } from "./comment-input";
import { CommentText } from "./comment-text";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  level?: number;
  threadParentId?: string;
  onReplySuccess?: (newReply: Comment) => void;
}

const MAX_LEVEL = 3;

export const CommentItem = memo(({
  comment,
  postId,
  level = 1,
  threadParentId,
  onReplySuccess,
}: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const [tempReplies, setTempReplies] = useState<Comment[]>([]);

  const { mutate: globalMutate } = useSWRConfig();

  const {
    replies,
    hasMore,
    isLoading: isRepliesCommentLoading,
    isLoadingMore,
    loadMore,
    mutate: localMutate
  } = useReplies(postId, comment.id, isExpanded);

  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const replyCount = comment.metrics.replyCount;

  const shouldShowExpandButton = !isExpanded && replyCount > tempReplies.length;
  const showNavigationBlock = isExpanded || shouldShowExpandButton;
  const submitParentId = level >= MAX_LEVEL && threadParentId ? threadParentId : comment.id;

  // 1. Hàm đưa bình luận mới vào hệ thống Cache của SWR
  const handleChildReply = useCallback((newReply: Comment) => {
    if (comment.id === submitParentId) {
      localMutate((currentPages: any) => {
        if (!currentPages || currentPages.length === 0) {
          return [{
            data: { items: [newReply], pagination: { hasMore: false, nextCursor: null } },
            isSuccess: true
          }];
        }
        const newPages = [...currentPages];

        // THAY ĐỔI Ở ĐÂY: Tìm trang (page) cuối cùng đang được tải để chèn vào cuối
        const lastPageIndex = newPages.length - 1;

        newPages[lastPageIndex] = {
          ...newPages[lastPageIndex],
          data: {
            ...newPages[lastPageIndex].data,
            // Đưa các comment cũ lên trước, nhét newReply vào cuối cùng
            items: [...(newPages[lastPageIndex].data?.items || []), newReply],
          },
        };
        return newPages;
      }, { revalidate: false });
    } else if (onReplySuccess) {
      onReplySuccess(newReply);
    }
  }, [comment.id, submitParentId, onReplySuccess, localMutate]);

  // 2. Hàm xử lý gửi Comment
  const handleReplySubmit = async (content: string) => {
    const response = await addComment(postId, content, submitParentId);

    if (response.isSuccess && response.data) {
      const newReply = response.data;

      setIsReplying(false);

      if (comment.id === submitParentId) {
        setTempReplies((prev) => [...prev, newReply]);
      }

      handleChildReply(newReply);

      globalMutate(
        (key: any) => Array.isArray(key) && (key[0] === 'comments' || key[0] === 'replies') && key[1] === postId,
        (currentData: any) => {
          if (!currentData) return currentData;

          if (Array.isArray(currentData)) {
            return currentData.map((page: any) => {
              if (!page?.data?.items || !Array.isArray(page.data.items)) return page;
              return {
                ...page,
                data: {
                  ...page.data,
                  items: page.data.items.map((c: Comment) => {
                    if (c.id === comment.id) {
                      return { ...c, metrics: { ...c.metrics, replyCount: c.metrics.replyCount + 1 } };
                    }
                    return c;
                  })
                }
              };
            });
          }

          if (currentData?.data?.items && Array.isArray(currentData.data.items)) {
            return {
              ...currentData,
              data: {
                ...currentData.data,
                items: currentData.data.items.map((c: Comment) => {
                  if (c.id === comment.id) {
                    return { ...c, metrics: { ...c.metrics, replyCount: c.metrics.replyCount + 1 } };
                  }
                  return c;
                })
              }
            };
          }
          return currentData;
        },
        { revalidate: false }
      );

      toast.success("Đã gửi câu trả lời");
    } else {
      toast.error("Đã có lỗi xảy ra");
    }
  };

  const fetchMentions = async (query: string) => {
    try {
      const response = await getUserMentions(query);
      return (response.isSuccess && response.data) ? response.data : [];
    } catch (error) {
      console.error("Lỗi tải mention:", error);
      return [];
    }
  };

  const debouncedFetchMentions = useDebounceCallback(fetchMentions, 300);

  const nextLevel = level >= MAX_LEVEL ? MAX_LEVEL : level + 1;
  const nextThreadParentId = level === 2 ? comment.id : threadParentId;

  return (
    <div className="flex w-full gap-2.5">
      {/* ── 1. AVATAR VÀ ĐƯỜNG NỐI DỌC ── */}
      <div className="flex flex-col items-center">
        <Link href={`/${comment.author.username}`}>
          <UserAvatar user={comment.author} />
        </Link>
        {isExpanded && replies.length > 0 && level < MAX_LEVEL && (
          <div className="bg-border mt-2 mb-1 w-0.5 flex-1 rounded-full opacity-50" />
        )}
      </div>

      {/* ── 2. NỘI DUNG COMMENT CHÍNH ── */}
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-card-foreground text-[12.5px] font-semibold">
            <Link href={`/${comment.author.username}`}>
              {comment.author.displayName}
            </Link>
          </span>
          <span className="text-foreground/60 text-[12.5px]">
            <CommentText content={comment.content} mentions={comment.mentions} />
          </span>
        </div>

        {/* ── 3. INFO & ACTIONS BAR ── */}
        <div className="text-foreground/30 mt-1 flex items-center gap-3 text-[11px]">
          <span>{formatRelativeTime(comment.createdAt)}</span>
          <button
            className={`hover:text-foreground/60 cursor-pointer font-semibold transition-colors ${comment.viewerContext?.isLiked ? "text-blue-500" : ""
              }`}
          >
            Thích {comment.metrics.likeCount > 0 && `(${comment.metrics.likeCount})`}
          </button>
          {comment.viewerContext?.canReply && (
            <button
              className="hover:text-foreground/60 cursor-pointer font-semibold transition-colors"
              onClick={() => setIsReplying(true)}
            >
              Trả lời
            </button>
          )}
        </div>

        {/* ── 4.A. HIỂN THỊ TẠM THỜI CÁC BÌNH LUẬN MỚI ── */}
        {!isExpanded && tempReplies.length > 0 && (
          <div className="mt-3 space-y-3">
            {tempReplies.map((reply) => (
              <CommentItem
                key={`temp-${reply.id}`}
                comment={reply}
                postId={postId}
                level={nextLevel}
                threadParentId={nextThreadParentId}
                onReplySuccess={handleChildReply}
              />
            ))}
          </div>
        )}

        {/* ── 4.B. DANH SÁCH REPLIES TỪ CACHE SWR ── */}
        {isExpanded && replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                level={nextLevel}
                threadParentId={nextThreadParentId}
                onReplySuccess={handleChildReply}
              />
            ))}
          </div>
        )}

        {/* ── 5. NÚT ĐIỀU HƯỚNG (XEM THÊM/ẨN BỚT) ── */}
        {showNavigationBlock && (
          <div className="mt-2">
            {shouldShowExpandButton && (
              <button
                onClick={() => {
                  setIsExpanded(true);
                  setTempReplies([]);
                }}
                className="text-foreground/50 hover:text-foreground/80 flex cursor-pointer items-center gap-2 text-[11px] font-semibold transition-colors"
              >
                <div className="bg-foreground/20 h-px w-6" />
                Xem {replyCount > 0 ? `${replyCount} câu trả lời` : "câu trả lời"}
              </button>
            )}

            {isExpanded && isRepliesCommentLoading && (
              <button disabled className="text-foreground/50 flex items-center gap-2 text-[11px] font-semibold opacity-50">
                <div className="bg-foreground/20 h-px w-6" /> Đang tải...
              </button>
            )}

            {isExpanded && !isRepliesCommentLoading && hasMore && (
              <div className="flex items-center gap-3">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="text-foreground/50 hover:text-foreground/80 flex cursor-pointer items-center gap-2 text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  <div className="bg-foreground/20 h-px w-6" />
                  {isLoadingMore ? "Đang tải..." : "Xem thêm câu trả lời"}
                </button>
                <span className="text-foreground/30 text-[10px]">•</span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-foreground/50 hover:text-foreground/80 cursor-pointer text-[11px] font-semibold transition-colors"
                >
                  Ẩn bớt
                </button>
              </div>
            )}

            {isExpanded && !isRepliesCommentLoading && !hasMore && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-foreground/50 hover:text-foreground/80 flex cursor-pointer items-center gap-2 text-[11px] font-semibold transition-colors"
              >
                <div className="bg-foreground/20 h-px w-6" /> Ẩn bớt câu trả lời
              </button>
            )}
          </div>
        )}

        {/* ── 6. KHUNG NHẬP TRẢ LỜI ── */}
        {isReplying && (
          <div className="mt-3">
            <CommentInput
              author={currentUser!}
              fetchMentions={debouncedFetchMentions}
              replyToUser={comment.author}
              onCancel={() => setIsReplying(false)}
              onSubmit={handleReplySubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
});

CommentItem.displayName = "CommentItem";