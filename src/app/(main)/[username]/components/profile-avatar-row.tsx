"use client";

import { UserAvatar } from "@/components/user/user-avatar";
import { UserProfile } from "@/types/user";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { compressImageClientSide, validateFile } from "@/lib/file-utils";
import { uploadFileToCloudinary } from "@/services/media.service";
import { deleteUserMediaPrimary, updateUserMedia } from "@/services/user.service";

interface ProfileAvatarRowProps {
  profile: UserProfile;
  isOwner?: boolean;
  onAvatarChange?: (newAvatarUrl: string) => void;
}

export default function ProfileAvatarRow({
  profile,
  isOwner = false,
  onAvatarChange,
}: ProfileAvatarRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // State quản lý hiển thị Popup xác nhận xóa
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      toast.error(`Lỗi: ${validation.error}`);
      if (event.target) event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const compressedFile = await compressImageClientSide(file);

      const localUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(localUrl);

      const uploadedMedia = await uploadFileToCloudinary(
        compressedFile,
        "avatars",
        (percent) => setUploadProgress(percent)
      );

      await updateUserMedia(
        {
          publicId: uploadedMedia.publicId,
          url: uploadedMedia.url,
          type: uploadedMedia.mimeType,
        },
        "Avatar"
      );

      toast.success("Cập nhật ảnh đại diện thành công!");

      if (onAvatarChange) {
        onAvatarChange(uploadedMedia.url);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
      toast.error("Không thể tải lên ảnh đại diện, vui lòng thử lại.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    setIsUploading(true);
    try {
      await deleteUserMediaPrimary("Avatar");

      toast.success("Đã xóa ảnh đại diện.");
      setPreviewUrl("");

      if (onAvatarChange) {
        onAvatarChange("");
      }
    } catch (error) {
      toast.error("Không thể xóa ảnh đại diện.");
    } finally {
      setIsUploading(false);
      setShowDeleteDialog(false);
    }
  };

  const displayProfile = {
    ...profile,
    avatarUrl: previewUrl ?? profile.avatarUrl,
  };

  return (
    <>
      <div className="relative z-10 -mt-16 mb-4 flex items-end justify-center px-5 md:-mt-24 md:px-7">
        <div className="relative rounded-full">
          {/* AVATAR GỐC */}
          <UserAvatar
            user={displayProfile}
            isShowDotOnline={profile?.viewerContext?.isFriend && !profile?.viewerContext?.isBlocked}
            className="h-28 w-28 md:h-36 md:w-36"
            initialClassName="text-4xl md:text-5xl"
            dotClassName={cn("h-6 w-6 bottom-2 right-2 border-[3px] border-background z-10")}
          />

          {/* OVERLAY KHI ĐANG UPLOAD */}
          {isUploading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-full bg-black/50 backdrop-blur-[2px] transition-all">
              <Loader2 className="h-6 w-6 animate-spin text-white mb-1" />
              <span className="text-xs font-bold text-white drop-shadow-md">
                {uploadProgress}%
              </span>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {isOwner && (
            <>
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
                    disabled={isUploading}
                    className={cn(
                      "absolute right-0 bottom-0 z-20",
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      "bg-muted text-foreground/80 border-background border-2 shadow-md",
                      "transition-all duration-200 focus:outline-none",
                      "hover:bg-primary hover:text-primary-foreground hover:scale-110",
                      "active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                      "md:h-11 md:w-11"
                    )}
                  >
                    <Camera className="h-5 w-5 md:h-6 md:w-6" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="center"
                  sideOffset={8}
                  className="bg-card border-border w-56 rounded-xl p-1.5 shadow-xl z-50"
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

                  {profile.avatarUrl && (
                    <>
                      <DropdownMenuSeparator className="bg-border/50 my-1" />
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
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

      {/* POPUP XÁC NHẬN XÓA AVATAR */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-106.25">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ảnh đại diện?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ gỡ ảnh đại diện hiện tại của bạn. Bạn có chắc chắn muốn tiếp tục không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUploading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAvatar();
              }}
              disabled={isUploading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa ảnh"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}