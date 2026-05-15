// components/posts/save-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
    postId: string;
    initialSaved: boolean;
}

export default function SaveButton({ postId, initialSaved }: SaveButtonProps) {
    const [saved, setSaved] = useState(initialSaved);

    const handleSave = async () => {
        // 1. Lưu lại trạng thái để Rollback nếu lỗi
        const previousSavedState = saved;

        // 2. Optimistic UI: Đổi màu nút ngay lập tức
        setSaved(!previousSavedState);

        // 3. Gọi API ngầm ở background
        // try {
        //     if (!previousSavedState) {
        //         await savePost(postId);
        //     } else {
        //         await unsavePost(postId);
        //     }
        // } catch (error) {
        //     console.error("Lỗi khi lưu bài viết:", error);
        //     // Rollback nếu thất bại
        //     setSaved(previousSavedState);
        //     // Tùy chọn: Thêm toast thông báo lỗi tại đây
        // }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={cn(
                "hidden h-8 w-8 rounded-lg transition-all duration-150",
                saved
                    ? "text-primary bg-primary/10 hover:bg-primary/15"
                    : "text-foreground/40 hover:text-foreground hover:bg-foreground/8",
            )}
        >
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </Button>
    );
}