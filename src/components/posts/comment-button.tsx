// components/posts/comment-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { formatCompactNumber } from "@/lib/format-number-utils";

interface CommentButtonProps {
    commentCount: number;
    onClick?: () => void;
}

export default function CommentButton({ commentCount, onClick }: CommentButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className="font-roboto text-foreground/50 hover:text-foreground hover:bg-foreground/8 h-8 cursor-pointer gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition-all duration-150"
            onClick={onClick}
        >
            <MessageCircle size={14} />
            <span>
                {commentCount < 10000
                    ? commentCount.toLocaleString("vi-VN")
                    : formatCompactNumber(commentCount)}
            </span>
        </Button>
    );
}