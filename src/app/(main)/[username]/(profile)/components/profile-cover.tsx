"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileCoverProps {
  cover: string | null;
  decorations?: { emoji: string; className: string }[];
  isOwner?: boolean;
}

const DEFAULT_DECORATIONS = [
  {
    emoji: "🌿",
    className:
      "absolute top-8 right-[12%] text-6xl opacity-10 rotate-12 select-none pointer-events-none",
  },
  {
    emoji: "📷",
    className:
      "absolute bottom-5 right-[28%] text-4xl opacity-8 -rotate-8 select-none pointer-events-none",
  },
];

export default function ProfileCover({
  cover,
  decorations = DEFAULT_DECORATIONS,
  isOwner = false,
}: ProfileCoverProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi người dùng chọn file ảnh bìa mới
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File ảnh bìa đã chọn:", file);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  // Xử lý khi người dùng chọn xóa ảnh bìa
  const handleDeleteCover = () => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa ảnh bìa này không?",
    );
    if (confirmDelete) {
      console.log("Tiến hành xóa ảnh bìa...");
    }
  };

  return (
    <div className="bg-muted relative h-52 w-full shrink-0 overflow-hidden md:h-80">
      {cover ? (
        <>
          <Image
            src={cover}
            alt="Profile Cover"
            className="object-cover"
            fill
          />
          <div className="absolute inset-0 bg-black/20" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gray-300" />
      )}

      <div
        className="absolute inset-0 opacity-[0.11]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.07)_0%,transparent_65%)]" />

      {!cover &&
        decorations.map((d, i) => (
          <span key={i} className={d.className}>
            {d.emoji}
          </span>
        ))}

      {isOwner && (
        <>
          {/* Thẻ input ẩn để chọn ảnh */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="absolute right-3 bottom-3 z-12 h-8 cursor-pointer gap-1.5 border-white/20 bg-black/40 text-[10px] tracking-wider text-white/70 uppercase backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/60 hover:text-white"
              >
                <Camera size={12} />
                Đổi ảnh bìa
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="bg-card border-border w-56 rounded-xl p-1.5 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => fileInputRef.current?.click()}
                className="hover:bg-muted focus:bg-muted cursor-pointer gap-3 rounded-lg p-3 text-sm font-medium"
              >
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <ImagePlus size={16} />
                </div>
                Thay đổi ảnh bìa
              </DropdownMenuItem>

              {/* Chỉ hiển thị lựa chọn Xóa nếu hiện tại đang có ảnh bìa */}
              {cover && (
                <>
                  <DropdownMenuSeparator className="bg-border/50 my-1" />
                  <DropdownMenuItem
                    onClick={handleDeleteCover}
                    className="text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer gap-3 rounded-lg p-3 text-sm font-medium"
                  >
                    <div className="bg-destructive/10 text-destructive flex h-8 w-8 items-center justify-center rounded-full">
                      <Trash2 size={16} />
                    </div>
                    Xóa ảnh bìa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
