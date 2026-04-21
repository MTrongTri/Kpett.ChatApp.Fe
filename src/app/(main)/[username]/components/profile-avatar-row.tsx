"use client";

import { UserAvatar } from "@/components/user/user-avatar";
import { UserProfile } from "@/types/user";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProfileAvatarRowProps {
  profile: UserProfile;
  isOwner?: boolean;
}

export default function ProfileAvatarRow({
  profile,
  isOwner = false,
}: ProfileAvatarRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File đã chọn:", file);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  // Xử lý khi người dùng bấm xóa avatar
  const handleDeleteAvatar = () => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa ảnh đại diện này?",
    );
    if (confirmDelete) {
      console.log("Tiến hành xóa avatar...");
    }
  };

  return (
    <div className="relative z-10 -mt-16 mb-4 flex items-end justify-center px-5 md:-mt-24 md:px-7">
      <div className="relative">
        <UserAvatar
          user={profile}
          isShowDotOnline={profile?.viewerContext?.isFriend && !profile?.viewerContext?.isBlocked}
          className="h-28 w-28 md:h-36 md:w-36"
          initialClassName="text-4xl md:text-5xl"
          dotClassName={cn(
            "h-6 w-6 bottom-2 right-2 border-[3px] border-background z-10",
          )}
        />

        {isOwner && (
          <>
            {/* Input file ẩn để hứng sự kiện chọn ảnh */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  title="Tùy chọn ảnh đại diện"
                  className={cn(
                    "absolute right-0 bottom-0 z-20",
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-muted text-foreground/80 border-background border-2 shadow-md",
                    "transition-all duration-200 focus:outline-none",
                    "hover:bg-primary hover:text-primary-foreground hover:scale-110",
                    "active:scale-95",
                    "md:h-11 md:w-11",
                  )}
                >
                  <Camera className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="center"
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
                  Thay đổi avatar
                </DropdownMenuItem>

                {/* Chỉ hiện nút xóa nếu người dùng đang có avatar (không phải ảnh mặc định) */}
                {profile.avatarUrl && (
                  <>
                    <DropdownMenuSeparator className="bg-border/50 my-1" />
                    <DropdownMenuItem
                      onClick={handleDeleteAvatar}
                      className="text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer gap-3 rounded-lg p-3 text-sm font-medium"
                    >
                      <div className="bg-destructive/10 text-destructive flex h-8 w-8 items-center justify-center rounded-full">
                        <Trash2 size={16} />
                      </div>
                      Xóa avatar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}
