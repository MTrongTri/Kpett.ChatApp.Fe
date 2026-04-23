"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// IMPORT THÊM ALERT DIALOG
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
import { openMediaLightBox } from "@/store/features/modal-slice";
import { useDispatch } from "react-redux";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary-utils";

interface ProfileCoverProps {
  cover: string | null;
  decorations?: { emoji: string; className: string }[];
  isOwner?: boolean;
  className?: string;
  onCoverChange?: (newCoverUrl: string) => void;
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
  className,
  onCoverChange,
}: ProfileCoverProps) {
  const dispatch = useDispatch();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // THÊM: State quản lý hiển thị Popup xác nhận xóa
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Xử lý khi người dùng chọn file ảnh bìa mới
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, {
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      maxImageSize: 1 * 1024 * 1024,
    });
    if (!validation.isValid) {
      toast.error(`Lỗi: ${validation.error}`);
      if (event.target) event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const compressedFile = await compressImageClientSide(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
      });

      const localUrl = URL.createObjectURL(compressedFile);
      setPreviewUrl(localUrl);

      const uploadedMedia = await uploadFileToCloudinary(
        compressedFile,
        "covers",
        (percent) => setUploadProgress(percent)
      );

      await updateUserMedia(
        {
          publicId: uploadedMedia.publicId,
          url: uploadedMedia.url,
          type: uploadedMedia.mimeType,
        },
        "Cover"
      );

      toast.success("Cập nhật ảnh bìa thành công!");

      if (onCoverChange) {
        onCoverChange(uploadedMedia.url);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh bìa:", error);
      toast.error("Không thể tải lên ảnh bìa, vui lòng thử lại.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteCover = async () => {
    setIsUploading(true);
    try {
      await deleteUserMediaPrimary("Cover");

      toast.success("Đã xóa ảnh bìa.");
      setPreviewUrl("");

      if (onCoverChange) {
        onCoverChange("");
      }
    } catch (error) {
      console.error("Lỗi khi xóa ảnh bìa:", error);
      toast.error("Không thể xóa ảnh bìa.");
    } finally {
      setIsUploading(false);
      setShowDeleteDialog(false);
    }
  };

  const displayCover = previewUrl ?? cover;

  const handleShowCover = () => {
    if (!displayCover) return;
    dispatch(openMediaLightBox({
      media: [
        {
          publicId: "",
          url: displayCover,
          type: "image",
        },
      ],
      index: 0,
    }));
  }

  return (
    <>
      <div className={cn("bg-muted relative h-full w-full shrink-0 overflow-hidden md:h-80", className)}>
        {displayCover ? (
          <>
            <button onClick={handleShowCover} className="absolute inset-0 z-10 cursor-pointer">
              <Image
                src={displayCover ? getOptimizedCloudinaryUrl(displayCover, "image") : ""}
                alt="Profile Cover"
                className="object-cover"
                fill
              />
            </button>
            <div className="absolute inset-0 bg-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-300" />
        )}

        {/* OVERLAY KHI ĐANG UPLOAD */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] transition-all">
            <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
            <span className="text-sm font-bold text-white drop-shadow-md">
              {uploadProgress}%
            </span>
          </div>
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

        {!displayCover &&
          decorations.map((d, i) => (
            <span key={i} className={d.className}>
              {d.emoji}
            </span>
          ))}

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
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUploading}
                  className="absolute right-3 bottom-3 z-30 h-8 cursor-pointer gap-1.5 border-white/20 bg-black/40 text-[10px] tracking-wider text-white/70 uppercase backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/60 hover:text-white disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Camera size={12} />
                  Đổi ảnh bìa
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
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
                  Thay đổi ảnh bìa
                </DropdownMenuItem>

                {displayCover && (
                  <>
                    <DropdownMenuSeparator className="bg-border/50 my-1" />
                    <DropdownMenuItem
                      // THAY ĐỔI: Mở Dialog thay vì gọi trực tiếp
                      onClick={() => setShowDeleteDialog(true)}
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

      {/* THÊM: POPUP XÁC NHẬN XÓA ẢNH BÌA */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-106.25">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ảnh bìa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ gỡ ảnh bìa hiện tại của bạn. Bạn có chắc chắn muốn tiếp tục không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUploading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Giữ popup mở trong lúc xóa
                handleDeleteCover();
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