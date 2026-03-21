"use client";

import { MOCK_CURENT_USER } from "@/data/user";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { useReplies } from "@/hooks/use-replies";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { addComment } from "@/services/comment.service";
import { getUserMentions } from "@/services/user.service";
import { Comment, MentionComment } from "@/types/comment";
import Link from "next/link";
import { useState } from "react";
import { UserAvatar } from "../user/user-avatar";
import { CommentInput } from "./comment-input";
import { CommentText } from "./comment-text";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  level?: number;
  threadParentId?: string;
  onReplySuccess?: (newReply: Comment) => void;
}

export const CommentItem = ({
  comment,
  postId,
  level = 1,
  threadParentId,
  onReplySuccess,
}: CommentItemProps) => {
  const MAX_LEVEL = 3;

  const [isReplying, setIsReplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [newLocalReplies, setNewLocalReplies] = useState<Comment[]>([]);

  const replyCount = comment.metrics.replyCount;
  const hasReplies = replyCount > 0;

  const {
    replies,
    hasMore,
    isLoading: isRepliesCommentLoading,
    isLoadingMore,
    loadMore,
  } = useReplies(comment.id, isExpanded);

  const submitParentId =
    level >= MAX_LEVEL && threadParentId ? threadParentId : comment.id;

  const handleReplySubmit = async (content: string) => {
    const mentions: MentionComment[] = [];

    const response = await addComment(
      postId,
      content,
      MOCK_CURENT_USER,
      submitParentId,
      mentions,
    );

    if (response.return && response.data) {
      const newReply = response.data;
      setIsReplying(false);

      if (comment.id === submitParentId) {
        setNewLocalReplies((prev) => [newReply, ...prev]);
      } else if (onReplySuccess) {
        onReplySuccess(newReply);
      }
    } else {
      console.error("Lỗi khi thêm bình luận:", response.message);
    }
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

  const handleChildReply = (newReply: Comment) => {
    if (comment.id === submitParentId) {
      setNewLocalReplies((prev) => [newReply, ...prev]);
    } else if (onReplySuccess) {
      onReplySuccess(newReply);
    }
  };

  return (
    <div className="flex w-full gap-2.5">
      {/* ── AVATAR VÀ ĐƯỜNG NỐI DỌC ── */}
      <div className="flex flex-col items-center">
        <Link href={`/${comment.author.username}`}>
          <UserAvatar user={comment.author} />
        </Link>
        {isExpanded && replies.length > 0 && level < MAX_LEVEL && (
          <div className="bg-border mt-2 mb-1 w-0.5 flex-1 rounded-full opacity-50" />
        )}
      </div>

      {/* ── NỘI DUNG COMMENT ── */}
      <div className="flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="text-card-foreground text-[12.5px] font-semibold">
            <Link href={`/${comment.author.username}`}>
              {comment.author.username}
            </Link>
          </span>
          <span className="text-foreground/60 text-[12.5px]">
            <CommentText
              content={comment.content}
              mentions={comment.mentions}
            />
          </span>
        </div>

        {/* Info & Actions bar */}
        <div className="text-foreground/30 mt-1 flex items-center gap-3 text-[11px]">
          <span>{formatRelativeTime(comment.createdAt)}</span>

          <button
            className={`hover:text-foreground/60 cursor-pointer font-semibold transition-colors ${
              comment.viewerContext?.isLiked ? "text-blue-500" : ""
            }`}
          >
            Thích
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

        {/* ── DANH SÁCH REPLIES ── */}
        {/* Lọc loại bỏ những bình luận Local đã được SWR tải về để tránh trùng lặp */}
        {(() => {
          // 1. Tạo danh sách các ID của comment Local (vừa mới thêm)
          const localReplyIds = new Set(newLocalReplies.map((r) => r.id));

          console.log(replies);

          // 2. Lọc bỏ các comment từ Server (SWR) nếu nó đã có mặt trong Local
          const visibleSwrReplies = replies.filter(
            (r) => !localReplyIds.has(r.id),
          );

          const nextLevel = level >= MAX_LEVEL ? MAX_LEVEL : level + 1;
          const nextThreadParentId = level === 2 ? comment.id : threadParentId;

          return (
            <>
              {/* 1. HIỂN THỊ LOCAL REPLIES (Luôn nằm trên cùng như bạn muốn ban đầu) */}
              {newLocalReplies.length > 0 && (
                <div className="mt-3 space-y-3">
                  {newLocalReplies.map((reply) => (
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

              {/* 2. DANH SÁCH TỪ SERVER (Đã được lọc sạch những comment trùng với Local) */}
              {isExpanded && visibleSwrReplies.length > 0 && (
                <div
                  className={`${newLocalReplies.length > 0 ? "mt-3" : "mt-3"} space-y-3`}
                >
                  {visibleSwrReplies.map((reply) => (
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
            </>
          );
        })()}

        {hasReplies && (
          <div className="mt-2">
            {/* TH1: Chưa mở (Collapsed) */}
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-foreground/50 hover:text-foreground/80 flex cursor-pointer items-center gap-2 text-[11px] font-semibold transition-colors"
              >
                <div className="bg-foreground/20 h-px w-6" />
                Xem {replyCount} câu trả lời
              </button>
            )}

            {/* TH2: Bấm mở lần đầu -> Đang chờ API (Hiển thị Đang tải) */}
            {isExpanded && isRepliesCommentLoading && (
              <button
                disabled
                className="text-foreground/50 flex items-center gap-2 text-[11px] font-semibold opacity-50"
              >
                <div className="bg-foreground/20 h-px w-6" />
                Đang tải...
              </button>
            )}

            {/* TH3: Đã tải xong lần đầu và VẪN CÒN data (Hiện Xem thêm + Ẩn bớt) */}
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

            {/* TH4: Đã tải xong và ĐÃ HẾT data (Chỉ hiện Ẩn bớt) */}
            {isExpanded && !isRepliesCommentLoading && !hasMore && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-foreground/50 hover:text-foreground/80 flex cursor-pointer items-center gap-2 text-[11px] font-semibold transition-colors"
              >
                <div className="bg-foreground/20 h-px w-6" />
                Ẩn bớt câu trả lời
              </button>
            )}
          </div>
        )}

        {/* ── KHUNG NHẬP TRẢ LỜI ── */}
        {isReplying && (
          <div className="mt-3">
            <CommentInput
              author={MOCK_CURENT_USER}
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
