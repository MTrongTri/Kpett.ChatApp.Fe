import React from "react";
import Link from "next/link";
import { MentionComment } from "@/types/comment";

interface CommentTextProps {
  content: string;
  mentions?: MentionComment[];
}

export const CommentText = ({ content, mentions = [] }: CommentTextProps) => {
  if (!content) return null;

  const parts = content.split(/(<@[^>]+>)/g);

  return (
    <span className="text-[12.5px] leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
      {parts.map((part, index) => {
        const match = part.match(/^<@([^>]+)>$/);

        if (match) {
          const userId = match[1];

          const mentionData = mentions?.find((m) => m.userId === userId);

          if (mentionData) {
            return (
              <Link
                key={index}
                href={`/${mentionData.username}`}
                className="cursor-pointer font-semibold text-blue-600 dark:text-blue-400"
              >
                {mentionData.username}
              </Link>
            );
          } else {
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

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
