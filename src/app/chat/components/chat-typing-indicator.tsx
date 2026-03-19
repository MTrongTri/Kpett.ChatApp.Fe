import ChatAvatar from "./chat-avatar";
import type { ChatUser } from "@/types/chat";

interface ChatTypingIndicatorProps {
  partner: ChatUser;
}

export default function ChatTypingIndicator({ partner }: ChatTypingIndicatorProps) {
  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0);  }
          50%       { transform: translateY(-4px); }
        }
        .typing-dot {
          width: 7px; height: 7px; border-radius: 50%;
          animation: typingBounce 1s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.30s; }
      `}</style>

      <div className="flex items-end gap-2">
        <ChatAvatar
          initial={partner.avatarInitial}
          gradient={partner.avatarGradient}
          size={28}
          radius={7}
        />
        <div
          className="
            flex items-center gap-1 px-4 py-3
            bg-card border border-border
            rounded-[18px_18px_18px_4px]
          "
        >
          <div className="typing-dot bg-foreground/30" />
          <div className="typing-dot bg-foreground/30" />
          <div className="typing-dot bg-foreground/30" />
        </div>
      </div>
    </>
  );
}
