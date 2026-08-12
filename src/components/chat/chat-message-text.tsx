import React from "react";
import Link from "next/link";
import { MessageMention, ParticipantResponse } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatMessageTextProps {
  content: string;
  isMine: boolean;
  mentions?: MessageMention[];
  participants?: ParticipantResponse[];
}

export function ChatMessageText({
  content,
  isMine,
  mentions = [],
  participants = [],
}: ChatMessageTextProps) {
  if (!content) return null;

  const parts = content.split(/(<@[^>]+>)/g);

  const resolveUser = (userId: string) => {
    const mention = mentions.find((m) => m.userId === userId);
    if (mention) return mention;

    return participants.find((p) => p.id === userId) ?? null;
  };

  return (
    <span className="whitespace-pre-wrap break-words">
      {parts.map((part, index) => {
        const match = part.match(/^<@([^>]+)>$/);

        if (match) {
          const user = resolveUser(match[1]);

          if (user) {
            return (
              <Link
                key={index}
                href={`/${user.username}`}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "font-semibold rounded-sm px-1 mx-[1px] cursor-pointer",
                  isMine
                    ? "text-primary-foreground bg-primary-foreground/20"
                    : "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40",
                )}
              >
                {user.displayName || user.username}
              </Link>
            );
          }

          return (
            <span key={index} className="italic opacity-60">
              [Người dùng không tồn tại]
            </span>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}