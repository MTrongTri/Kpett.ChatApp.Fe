"use client";

import { useCommentReplies } from "@/hooks/comment/use-comment-replies";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { RootState } from "@/store/store";
import { Comment } from "@/types/comment";
import Link from "next/link";
import { memo, useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { UserAvatar } from "../user/user-avatar";
import { CommentInput } from "./comment-input";
import { CommentText } from "./comment-text";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Hooks React Query
import { useCreateCommentReply } from "@/hooks/comment/use-create-comment-reply";
import { useManageComment } from "@/hooks/comment/use-manage-comment";
import { useCommentReaction } from "@/hooks/comment/use-comment-reaction";
import { getFriendsWithFilter } from "@/services/friend.service";
import { toast } from "sonner";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  level?: number;
  threadParentId?: string;
  onReplySuccess?: (newReply: Comment) => void;
  onEditSuccess?: (updatedComment: Comment) => void;
  onDelete?: (commentId: string) => void;
}

const MAX_LEVEL = 3;

export const CommentItem = memo(({
  comment,
  postId,
  level = 1,
  threadParentId,
  onReplySuccess,
  onEditSuccess,
  onDelete,
}: CommentItemProps) => {
  const [currentComment, setCurrentComment] = useState<Comment>(comment);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    setCurrentComment(comment);
  }, [comment]);

  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Dùng tempReplies để hiển thị Optimistic UI (hiển thị ngay lập tức) 
  // trong lúc React Query gọi background fetch cập nhật list replies
  const [tempReplies, setTempReplies] = useState<Comment[]>([]);

  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const {
    replies,
    hasMore,
    isLoading: isRepliesLoading,
    isLoadingMore,
    loadMore
  } = useCommentReplies(postId, currentComment.id, isExpanded);

  const isAuthor = currentUser?.id === currentComment.author.id;
  const replyCount = currentComment.metrics.replyCount;
  const submitParentId = level >= MAX_LEVEL && threadParentId ? threadParentId : currentComment.id;
  const nextLevel = Math.min(level + 1, MAX_LEVEL);
  const nextThreadParentId = level === 2 ? currentComment.id : threadParentId;
  const showVerticalLine = isExpanded && replies.length > 0 && level < MAX_LEVEL;

  const handleChildEdit = useCallback((updatedComment: Comment) => {
    setTempReplies((prev) => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
    if (onEditSuccess) {
      onEditSuccess(updatedComment);
    }
  }, [onEditSuccess]);

  const handleChildDelete = useCallback((commentId: string) => {
    setTempReplies((prev) => prev.filter(r => r.id !== commentId));
  }, []);

  const handleChildReply = useCallback((newReply: Comment) => {
    if (currentComment.id === submitParentId) {
      setTempReplies((prev) => [...prev, newReply]);
    } else if (onReplySuccess) {
      onReplySuccess(newReply);
    }
  }, [currentComment.id, submitParentId, onReplySuccess]);

  // Hook tạo reply mới (Đã tích hợp React Query)
  const { handleReplySubmit } = useCreateCommentReply({
    postId,
    commentId: currentComment.id,
    submitParentId,
    onReplySuccess: (newReply, isDirectChild) => {
      setIsReplying(false);
      if (isDirectChild) {
        setTempReplies((prev) => [...prev, newReply]);
        setIsExpanded(true);
      } else if (onReplySuccess) {
        onReplySuccess(newReply);
      }
    }
  });

  // Hook quản lý comment: like, unlike
  const { toggleLike } = useCommentReaction(postId);

  // Hook quản lý comment: sửa, xóa
  const { handleEditSubmit, handleDeleteSubmit } = useManageComment({
    postId,
    commentId: currentComment.id,
    onSuccess: (updatedComment) => {
      setIsEditing(false);
      if (updatedComment) {
        setCurrentComment(updatedComment);
        if (onEditSuccess) onEditSuccess(updatedComment);
      }
    },
    onDeleteSuccess: () => {
      setIsDeleted(true);
      if (onDelete) onDelete(currentComment.id);
    }
  });

  const fetchMentions = async (query: string) => {
    try {
      const response = await getFriendsWithFilter({ search: query, cursor: null, limit: 10 });
      return response.items;
    } catch (error) {
      console.error("Lỗi tải mention:", error);
      return [];
    }
  };
  const debouncedFetchMentions = useDebounceCallback(fetchMentions, 300);

  // Lọc bỏ trùng lặp giữa tempReplies và replies
  const renderReplies = (replyList: Comment[], keyPrefix: string = "") => {
    // Nếu là tempReplies, kiểm tra xem nó đã tồn tại trong replies chính chưa
    const displayList = keyPrefix === "temp-"
      ? replyList.filter(temp => !replies.some(r => r.id === temp.id))
      : replyList;

    if (displayList.length === 0) return null;

    return (
      <div className="mt-3 space-y-3">
        {displayList.map((reply) => (
          <CommentItem
            key={`${keyPrefix}${reply.id}`}
            comment={reply}
            postId={postId}
            level={nextLevel}
            threadParentId={nextThreadParentId}
            onReplySuccess={handleChildReply}
            onEditSuccess={handleChildEdit}
            onDelete={handleChildDelete}
          />
        ))}
      </div>
    );
  };

  if (isDeleted) {
    return null;
  }

  return (
    <div className="flex w-full gap-2.5 group">
      <div className="flex flex-col items-center pt-1">
        <Link href={`/${currentComment.author.username}`}>
          <UserAvatar user={currentComment.author} />
        </Link>
        {showVerticalLine && <div className="bg-border mt-2 mb-1 w-0.5 flex-1 rounded-full opacity-50" />}
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="mt-1">
            <CommentInput
              author={currentUser!}
              fetchMentions={debouncedFetchMentions}
              defaultValue={currentComment.content}
              mentions={currentComment.mentions}
              onCancel={() => setIsEditing(false)}
              onSubmit={handleEditSubmit}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-1.5 mt-1">
              <Link href={`/${currentComment.author.username}`} className="text-card-foreground text-[12.5px] font-semibold">
                {currentComment.author.displayName}
              </Link>
              <span className="text-foreground/80 text-[12.5px]">
                <CommentText content={currentComment.content} mentions={currentComment.mentions} />
              </span>
            </div>

            <div className="text-foreground/40 mt-1.5 flex items-center gap-3 text-[11px]">
              <span>{formatRelativeTime(currentComment.createdAt)}</span>
              {currentComment.isEdited && <span>(Đã chỉnh sửa)</span>}

              <button
                className={`hover:text-foreground/80 cursor-pointer font-semibold transition-colors ${currentComment.viewerContext?.isLiked ? "text-blue-500 hover:text-blue-600" : ""}`}
                onClick={() => toggleLike(currentComment)}
              >
                {currentComment.viewerContext?.isLiked ? "Đã thích" : "Thích"}
                {currentComment.metrics.likeCount > 0 && ` (${currentComment.metrics.likeCount})`}
              </button>

              {currentComment.viewerContext?.canReply && (
                <button className="hover:text-foreground/80 cursor-pointer font-semibold transition-colors" onClick={() => {
                  if (!currentUser) {
                    toast.warning("Bạn cần đăng nhập để thực hiện bình luận");
                    return;
                  }
                  setIsReplying(true)
                }}>
                  Trả lời
                </button>
              )}

              {isAuthor && (
                <>
                  <button
                    className="hover:text-foreground/80 cursor-pointer font-semibold transition-colors"
                    onClick={() => setIsEditing(true)}
                  >
                    Sửa
                  </button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="hover:text-destructive cursor-pointer font-semibold transition-colors">
                        Xóa
                      </button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="border-none outline-none">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa bình luận?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này không thể hoàn tác. Bình luận của bạn sẽ bị xóa vĩnh viễn khỏi bài viết này.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteSubmit}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </>
        )}

        {/* Tránh render trùng lặp UI với cơ chế bóc tách tempReplies mới */}
        {!isExpanded && renderReplies(tempReplies, "temp-")}
        {isExpanded && renderReplies(tempReplies, "temp-")}
        {isExpanded && renderReplies(replies)}

        <CommentNavigation
          isExpanded={isExpanded}
          replyCount={replyCount}
          tempRepliesCount={tempReplies.length}
          isLoading={isRepliesLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onExpand={() => setIsExpanded(true)}
          onCollapse={() => { setIsExpanded(false); setTempReplies([]); }}
          onLoadMore={loadMore}
        />

        {isReplying && (
          <div className="mt-3">
            <CommentInput
              author={currentUser!}
              fetchMentions={debouncedFetchMentions}
              replyToUser={currentComment.author}
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

// --- SUB COMPONENTS ---
interface CommentNavigationProps {
  isExpanded: boolean;
  replyCount: number;
  tempRepliesCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onLoadMore: () => void;
}

const CommentNavigation = ({
  isExpanded, replyCount, tempRepliesCount, isLoading, isLoadingMore, hasMore, onExpand, onCollapse, onLoadMore
}: CommentNavigationProps) => {
  const shouldShowExpand = !isExpanded && replyCount > tempRepliesCount;

  if (!isExpanded && !shouldShowExpand) return null;

  return (
    <div className="mt-2">
      {shouldShowExpand && (
        <button onClick={onExpand} className="text-foreground/50 hover:text-foreground/80 flex cursor-pointer items-center gap-2 text-[11px] font-semibold transition-colors">
          Xem {replyCount > 0 ? `${replyCount} câu trả lời` : "câu trả lời"}
        </button>
      )}

      {isExpanded && isLoading && (
        <button disabled className="text-foreground/50 flex items-center gap-2 text-[11px] font-semibold opacity-50">
          Đang tải...
        </button>
      )}

      {isExpanded && !isLoading && hasMore && (
        <div className="flex items-center gap-3">
          <button onClick={onLoadMore} disabled={isLoadingMore} className="text-foreground/50 hover:text-foreground/80 flex cursor-pointer items-center gap-2 text-[11px] font-semibold transition-colors disabled:opacity-50">
            {isLoadingMore ? "Đang tải..." : "Xem thêm câu trả lời"}
          </button>
          <span className="text-foreground/30 text-[10px]">•</span>
          <button onClick={onCollapse} className="text-foreground/50 hover:text-foreground/80 cursor-pointer text-[11px] font-semibold transition-colors">
            Ẩn bớt
          </button>
        </div>
      )}

      {isExpanded && !isLoading && !hasMore && (
        <button onClick={onCollapse} className="text-foreground/50 hover:text-foreground/80 flex cursor-pointer items-center gap-2 text-[11px] font-semibold transition-colors">
          Ẩn bớt câu trả lời
        </button>
      )}
    </div>
  );
};
