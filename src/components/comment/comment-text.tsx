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
    <span className="whitespace-pre-wrap">
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
                {mentionData.displayName}
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

        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const subParts = part.split(urlRegex);

        return (
          <React.Fragment key={index}>
            {subParts.map((subPart, subIndex) => {
              if (subPart.match(urlRegex)) {
                return (
                  <a
                    key={`${index}-${subIndex}`}
                    href={subPart}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {subPart}
                  </a>
                );
              }
              return <React.Fragment key={`${index}-${subIndex}`}>{subPart}</React.Fragment>;
            })}
          </React.Fragment>
        );
      })}
    </span>
  );
};
