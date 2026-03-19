"use client";

import { useDebounceCallback } from "@/hooks/use-debounce";
import { useReplies } from "@/hooks/use-replies";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { getUserMentions } from "@/services/user.service";
import { Comment } from "@/types/comment";
import Link from "next/link";
import { useState } from "react";
import { UserAvatar } from "../user/user-avatar";
import { CommentInput } from "./comment-input";
import { CommentText } from "./comment-text";

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

export const CommentItem = ({ comment, postId }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const replyCount = comment.metrics.replyCount;
  const hasReplies = replyCount > 0;

  const {
    replies,
    hasMore,
    isLoading: isRepliesCommentLoading,
    isLoadingMore,
    loadMore,
  } = useReplies(comment.id, isExpanded);

  const handleReplySubmit = async (content: string) => {
    console.log(`Gửi reply cho comment ${comment.id}:`, content);
    setIsReplying(false);
  };

  const fetchMentions = async (query: string) => {
    try {
      const response = await getUserMentions(query);
      if (response.return && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Lỗi tải mention:", error);
      return [];
    }
  };

  const debouncedFetchMentions = useDebounceCallback(fetchMentions, 300);

  return (
    <div className="flex w-full gap-2.5">
      <div className="flex flex-col items-center">
        <Link href={comment.author.username}>
          <UserAvatar user={comment.author} />
        </Link>
        {isExpanded && replies.length > 0 && (
          <div className="bg-border mt-2 mb-1 w-0.5 flex-1 rounded-full opacity-50" />
        )}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-card-foreground text-[12.5px] font-semibold">
            <Link href={comment.author.username}>
              {comment.author.username}
            </Link>
          </span>
          <span className="text-foreground/60 text-[12.5px]">
            {
              <CommentText
                content={comment.content}
                mentions={comment.mentions}
              />
            }
          </span>
        </div>

        <div className="text-foreground/30 mt-1 flex items-center gap-3 text-[11px]">
          <span>{formatRelativeTime(comment.createdAt)}</span>

          <button
            className={`hover:text-foreground/60 cursor-pointer font-semibold transition-colors ${comment.viewerContext?.isLiked ? "text-blue-500" : ""}`}
          >
            Thích{" "}
            {comment.metrics.likeCount > 0 && `(${comment.metrics.likeCount})`}
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

        {/* Danh sách replies */}
        {isExpanded && replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} postId={postId} />
            ))}

            {/* Nút "Xem thêm" — chỉ hiện khi còn trang */}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="text-foreground/50 hover:text-foreground/80 mt-1 flex items-center gap-2 text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                <div className="bg-foreground/20 h-px w-6" />
                {isLoadingMore ? "Đang tải..." : "Xem thêm câu trả lời"}
              </button>
            )}
          </div>
        )}

        {/* Nút toggle expand / collapse */}
        {hasReplies && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            disabled={isRepliesCommentLoading}
            className="text-foreground/50 hover:text-foreground/80 mt-2 flex items-center gap-2 text-[11px] font-semibold transition-colors disabled:opacity-50"
          >
            <div className="bg-foreground/20 h-px w-6" />
            {isRepliesCommentLoading
              ? "Đang tải"
              : `Xem thêm ${replyCount} câu trả lời`}
          </button>
        )}

        {isExpanded && !hasMore && (
          <button
            onClick={() => setIsExpanded(false)}
            disabled={isRepliesCommentLoading}
            className="text-foreground/50 hover:text-foreground/80 mt-2 flex items-center gap-2 text-[11px] font-semibold transition-colors disabled:opacity-50"
          >
            <div className="bg-foreground/20 h-px w-6" />
            Ẩn bớt câu trả lời
          </button>
        )}

        {isReplying && (
          <div className="mt-2">
            <CommentInput
              author={comment.author}
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
};
