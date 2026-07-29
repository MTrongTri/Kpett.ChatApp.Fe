"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share2, Link } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard-utils";
import { toast } from "sonner";

interface ShareButtonProps {
  postId: string;
}

export default function ShareButton({ postId }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  const postUrl = `${window.location.origin}/post/${postId}`;

  const handleCopyLink = useCallback(async () => {
    const success = await copyToClipboard(postUrl);
    if (success) {
      toast.success("Đã sao chép liên kết");
    } else {
      toast.error("Không thể sao chép liên kết");
    }
    setOpen(false);
  }, [postUrl]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg transition-all duration-150 text-foreground/40 hover:text-foreground hover:bg-foreground/8"
        >
          <Share2 size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={6} className="w-48 p-1">
        <button
          onClick={handleCopyLink}
          className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <Link size={15} className="text-muted-foreground" />
          Sao chép liên kết
        </button>
      </PopoverContent>
    </Popover>
  );
}
