import React from "react";
import Link from "next/link";
import { MentionComment } from "@/types/comment";

interface CommentTextProps {
  content: string;
  mentions?: MentionComment[];
}

export const CommentText = ({ content, mentions = [] }: CommentTextProps) => {
  if (!content) return null;

  // Regex giải thích:
  // /<@[^>]+>/ match các chuỗi có dạng <@bất_kỳ_chữ_gì_trừ_dấu_ngoặc_nhọn>
  // Thêm () bao quanh để biến nó thành Capture Group.
  // Khi dùng split() với Capture Group, phần bị cắt (token) sẽ ĐƯỢC GIỮ LẠI trong mảng kết quả.
  // VD: "Hi <@user_1>!" -> split -> ["Hi ", "<@user_1>", "!"]
  const parts = content.split(/(<@[^>]+>)/g);

  return (
    <span className="text-[14px] leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
      {parts.map((part, index) => {
        // Kiểm tra xem part hiện tại có phải là token mention không
        const match = part.match(/^<@([^>]+)>$/);

        if (match) {
          const userId = match[1]; // Lấy ra "user_1"

          // Tìm data của user này trong mảng mentions API trả về
          const mentionData = mentions?.find((m) => m.userId === userId);

          if (mentionData) {
            // TÌM THẤY: Render thẻ Link
            return (
              <Link
                key={index}
                href={`/${mentionData.username}`}
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                {mentionData.displayName}
              </Link>
            );
          } else {
            // KHÔNG TÌM THẤY (Edge case: User đã bị xóa, hoặc lỗi data)
            // Render text fallback để không làm vỡ UI
            return (
              <span
                key={index}
                className="text-gray-500 italic dark:text-gray-400"
              >
                [Người dùng không tồn tại]
              </span>
            );
          }
        }

        // Nếu là text bình thường, render ra nguyên bản
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
