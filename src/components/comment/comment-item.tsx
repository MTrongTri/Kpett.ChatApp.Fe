"use client";

import React, { useState } from "react";
import { Comment } from "@/types/comment";
import { UserAvatar } from "../user/user-avatar";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { getRepliesByCommentId } from "@/services/comment.service";
import { CommentText } from "./comment-text";

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

export const CommentItem = ({ comment, postId }: CommentItemProps) => {
  const [replies, setReplies] = useState<Comment[]>([]);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const replyCount = comment.metrics.replyCount;
  const hasReplies = replyCount > 0;

  const handleToggleReplies = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    if (replies.length === 0) {
      setIsLoading(true);
      try {
        const fetchedReplies = await getRepliesByCommentId(postId, comment.id);
        setReplies(fetchedReplies.data?.items || []);
      } catch (error) {
        console.error("Lỗi khi tải phản hồi:", error);
      } finally {
        setIsLoading(false);
        setIsExpanded(true);
      }
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className="flex w-full gap-2.5">
      <div className="flex flex-col items-center">
        <UserAvatar user={comment.author} />
        {isExpanded && replies.length > 0 && (
          <div className="bg-border mt-2 mb-1 w-0.5 flex-1 rounded-full opacity-50" />
        )}
      </div>

      <div className="flex-1 pb-3">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-card-foreground text-[12.5px] font-semibold">
            {comment.author.username}
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
            <button className="hover:text-foreground/60 cursor-pointer font-semibold transition-colors">
              Trả lời
            </button>
          )}
        </div>

        {hasReplies && (
          <button
            onClick={handleToggleReplies}
            disabled={isLoading}
            className="text-foreground/50 hover:text-foreground/80 mt-2 flex items-center gap-2 text-[11px] font-semibold transition-colors disabled:opacity-50"
          >
            <div className="bg-foreground/20 h-[1px] w-6" />
            {isLoading
              ? "Đang tải..."
              : isExpanded
                ? "Ẩn bớt phản hồi"
                : `Xem ${replyCount} câu trả lời`}
          </button>
        )}

        {isExpanded && replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} postId={postId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
