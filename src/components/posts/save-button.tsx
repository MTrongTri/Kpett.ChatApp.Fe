"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { savePost, unsavePost } from "@/services/post.service";
import { toast } from "sonner";

interface SaveButtonProps {
    postId: string;
    initialSaved: boolean;
}

export default function SaveButton({ postId, initialSaved }: SaveButtonProps) {
    const [saved, setSaved] = useState(initialSaved);

    const handleSave = async () => {
        const previousSavedState = saved;
        setSaved(!previousSavedState);

        try {
            if (!previousSavedState) {
                await savePost(postId);
            } else {
                await unsavePost(postId);
            }
        } catch {
            setSaved(previousSavedState);
            toast.error("Không thể lưu bài viết");
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={cn(
                "hidden h-8 w-8 rounded-lg transition-all duration-150 md:flex",
                saved
                    ? "text-primary bg-primary/10 hover:bg-primary/15"
                    : "text-foreground/40 hover:text-foreground hover:bg-foreground/8",
            )}
        >
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </Button>
    );
}