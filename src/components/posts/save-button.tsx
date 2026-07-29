"use client";

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCheckSaved, useSavePost, useUnsavePost } from "@/hooks/post/use-save-post";

interface SaveButtonProps {
    postId: string;
    initialSaved: boolean;
}

export default function SaveButton({ postId, initialSaved }: SaveButtonProps) {
    const { data: isSaved } = useCheckSaved(postId);
    const { mutate: doSave, isPending: isSaving } = useSavePost(postId);
    const { mutate: doUnsave, isPending: isUnsaving } = useUnsavePost(postId);

    const saved = isSaved ?? initialSaved;
    const loading = isSaving || isUnsaving;

    const handleSave = () => {
        if (loading) return;
        if (saved) {
            doUnsave();
        } else {
            doSave();
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={loading}
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
