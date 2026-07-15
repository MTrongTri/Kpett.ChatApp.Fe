"use client";

import { cn }    from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Save }   from "lucide-react";

interface EditProfileSaveBarProps {
  dirty:      boolean;
  saving:     boolean;
  onSave:     () => void;
  onDiscard:  () => void;
}

export default function EditProfileSaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
}: EditProfileSaveBarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 inset-x-0 z-50",
        "border-t border-border",
        "bg-background/95 backdrop-blur-xl",
        "px-6 py-3.5",
        "flex items-center justify-between",
        "shadow-[0_-8px_32px_rgba(0,0,0,0.12)]",
        "transition-all duration-300",
        dirty
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      {/* Dirty indicator */}
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
        <span className=" text-xs text-muted-foreground">
          Có thay đổi chưa lưu
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDiscard}
          disabled={saving}
          className="
             text-[11px] uppercase tracking-wider
            border-border hover:border-foreground/30
          "
        >
          Huỷ
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="
            gap-1.5  text-[11px] uppercase tracking-wider
            bg-primary text-primary-foreground
            hover:bg-primary/90
            shadow-[0_4px_14px_rgba(245,158,11,0.35)]
            min-w-[130px]
          "
        >
          <Save size={13} />
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}