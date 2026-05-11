"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { addReaction, removeReaction } from "@/services/post.service";
import { useAuth } from "../providers/auth-provider";
import { toast } from "sonner";

interface LikeButtonProps {
    postId: string;
    initialLiked: boolean;
    initialLikeCount: number;
}

export default function LikeButton({
    postId,
    initialLiked,
    initialLikeCount,
}: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);

    const { isAuthenticated } = useAuth();

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.warning("Vui lòng đăng nhập để thích bài viết.");
            return;
        }

        // Lưu lại trạng thái trước khi bấm (để rollback nếu lỗi)
        const previousLikedState = liked;
        const previousLikeCount = likeCount;

        // Optimistic UI: Cập nhật giao diện lập tức
        setLiked(!previousLikedState);
        setLikeCount((prev) => (previousLikedState ? prev - 1 : prev + 1));

        // Gọi API ngầm
        try {
            if (!previousLikedState) {
                await addReaction(postId);
            } else {
                await removeReaction(postId);
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái Like:", error);
            // Rollback nếu có lỗi
            setLiked(previousLikedState);
            setLikeCount(previousLikeCount);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
                "font-roboto h-8 cursor-pointer gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition-all duration-150",
                liked
                    ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/15 hover:text-rose-400"
                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/8",
            )}
        >
            <Heart
                size={14}
                className={cn("transition-transform", liked && "scale-110")}
                fill={liked ? "currentColor" : "none"}
            />
            {likeCount < 10000 ? (
                <span>{likeCount.toLocaleString("vi-VN")}</span>
            ) : (
                <span>{formatCompactNumber(likeCount)}</span>
            )}
        </Button>
    );
}