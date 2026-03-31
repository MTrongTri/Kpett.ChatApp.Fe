import { Button } from "@/components/ui/button";
import { useMediaLightbox } from "@/hooks/use-media-lightbox";
import { compressImageClientSide, validateFile } from "@/lib/file-utils";
import { uploadFileToCloudinary } from "@/services/media.service";
import { deleteMedia } from "@/services/post.service";
import { Media } from "@/types/media";
import { Loader2, Play, Plus, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import { MediaLightbox } from "../media-lightbox";

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
}

interface MediaUploaderProps {
  media: Media[];
  onChange: (media: Media[]) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function MediaUploader({ media, onChange, onLoadingChange }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State quản lý những file ĐANG tải lên
  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  // Quản lý danh sách ID của các file ĐANG ĐƯỢC XÓA
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const latestMediaRef = useRef(media);
  const successfullyDeletedIdsRef = useRef<Set<string>>(new Set());

  const {
    isOpen: isOpenMediaLightBox,
    media: mediaLightbox,
    currentIndex,
    openLightbox: openMediaLightBox,
    handleOpenChange,
  } = useMediaLightbox();

  // Cập nhật ref mỗi khi media thay đổi để tránh stale closure trong các hàm async
  useEffect(() => {
    latestMediaRef.current = media;
  }, [media]);

  // Tính toán trạng thái loading tổng hợp: Đang upload HOẶC đang xóa
  const isUploading = uploadQueue.length > 0;
  const isDeleting = deletingIds.length > 0;
  const isBusy = useMemo(() => isUploading || isDeleting, [isUploading, isDeleting]);

  // Gọi callback onLoadingChange mỗi khi trạng thái isBusy thay đổi
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isBusy);
    }
  }, [isBusy, onLoadingChange]);
  // ------------------------------------------

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];

    // Validate toàn bộ file
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        toast.error(`File ${file.name}: ${validation.error}`);
        continue; // Bỏ qua file lỗi, duyệt tiếp file khác
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      // Nén ảnh ngầm trước khi đưa vào hàng đợi upload
      // Tối ưu: Thêm try-catch trong map để nếu 1 file lỗi nén thì không chết toàn bộ
      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          try {
            // Giả sử hàm này trả về File. Nếu nén lỗi, trả về file gốc.
            return await compressImageClientSide(file);
          } catch (error) {
            console.error("Lỗi nén file:", file.name, error);
            return file;
          }
        })
      );

      // Đưa processedFiles vào uploadQueue
      const newQueueItems: UploadingFile[] = processedFiles.map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
        progress: 0,
      }));

      setUploadQueue((prev) => [...prev, ...newQueueItems]);

      // Xử lý upload song song với Promise.allSettled
      const uploadPromises = newQueueItems.map(async (queueItem) => {
        try {
          const result = await uploadFileToCloudinary(queueItem.file, (percent) => {
            // Cập nhật state progress riêng cho từng file
            setUploadQueue((currentQueue) =>
              currentQueue.map((item) =>
                item.id === queueItem.id ? { ...item, progress: percent } : item
              )
            );
          });
          return { success: true, item: queueItem, result };
        } catch (error) {
          return { success: false, item: queueItem, error };
        }
      });

      const results = await Promise.allSettled(uploadPromises);

      // Bóc tách kết quả
      const successfulUploads: Media[] = [];
      const completedIds: string[] = [];
      let hasError = false;

      results.forEach((res) => {
        if (res.status === "fulfilled") {
          completedIds.push(res.value.item.id);
          if (res.value.success) {
            successfulUploads.push(res.value.result!);
          } else {
            console.error("Lỗi upload file:", res.value.item.file.name, res.value.error);
            hasError = true;
          }
        }
      });

      if (hasError) {
        toast.error("Một số file tải lên không thành công.");
      }

      // Thêm các file thành công vào danh sách hiển thị
      if (successfulUploads.length > 0) {
        const updatedMedia = [...latestMediaRef.current, ...successfulUploads];
        onChange(updatedMedia);
        latestMediaRef.current = updatedMedia;
      }

      // Dọn dẹp hàng đợi (Xóa các file đã xử lý xong)
      setUploadQueue((currentQueue) =>
        currentQueue.filter((item) => !completedIds.includes(item.id))
      );
    } catch (error) {
      toast.error("Đã có lỗi bất ngờ xảy ra khi xử lý file.");
    } finally {
      // Đảm bảo luôn reset input để có thể chọn lại chính file đó nếu cần
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (itemToRemove: Media) => {
    try {
      setDeletingIds((prev) => [...prev, itemToRemove.publicId]);

      await deleteMedia(itemToRemove.publicId, itemToRemove.type);

      successfullyDeletedIdsRef.current.add(itemToRemove.publicId);

      // Sử dụng latestMediaRef để filter nhằm đảm bảo lấy state mới nhất
      const newMedia = latestMediaRef.current.filter(
        (m) => !successfullyDeletedIdsRef.current.has(m.publicId)
      );
      onChange(newMedia);
      latestMediaRef.current = newMedia;

    } catch (error) {
      toast.error("Không thể xóa file, vui lòng thử lại.");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== itemToRemove.publicId));
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="text-muted-foreground mb-3 text-[11px]">
        Chọn ảnh hoặc video tải lên từ thiết bị (Có thể chọn nhiều file).
      </div>

      {media.length === 0 && !isUploading ? (
        // --- TRẠNG THÁI TRỐNG ---
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-border hover:bg-secondary/50 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors"
        >
          <div className="bg-secondary/80 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <UploadCloud className="text-primary h-7 w-7" />
          </div>
          <p className="text-foreground text-sm font-semibold">
            Nhấn để tải lên ảnh hoặc video
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            Hỗ trợ định dạng JPG, PNG, MP4, WEBM
          </p>
        </div>
      ) : (
        // --- TRẠNG THÁI CÓ FILE HOẶC ĐANG UPLOAD ---
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

          {/* Hiển thị các file ĐÃ UPLOAD XONG */}
          {media.map((item, index) => {
            const isDeletingItem = deletingIds.includes(item.publicId);

            return (
              <div
                key={item.publicId}
                className="border-border group relative flex aspect-square items-center justify-center rounded-xl overflow-hidden border bg-black/5"
              >
                {/* Lớp phủ mờ đi khi đang xóa */}
                {isDeletingItem && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {item.type === "video" ? (
                  <div
                    className="group/video relative h-full w-full cursor-pointer"
                    onClick={() => openMediaLightBox(mediaLightbox, index)}
                  >
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      preload="metadata"
                    />
                    {/* Overlay làm tối nhẹ và Nút Play */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all group-hover/video:bg-black/25">
                      <Play className="h-14 w-14 text-white opacity-90 drop-shadow-lg transition-transform duration-200 group-hover/video:scale-110" />
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt="Uploaded" className="h-full w-full object-cover" onClick={() => openMediaLightBox(mediaLightbox, index)} />
                )}

                {/* Nút Xóa */}
                <Button
                  variant="destructive"
                  size="icon"
                  disabled={isDeletingItem}
                  className={`absolute top-1.5 right-1.5 z-20 h-6 w-6 rounded-full shadow-md transition-opacity 
                    ${isDeletingItem ? "opacity-100 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}

          {/* Hiển thị các file ĐANG UPLOAD (Có Progress Bar) */}
          {uploadQueue.map((uploadItem) => (
            <div
              key={uploadItem.id}
              className="border-border relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border bg-secondary/30"
            >
              <div className="z-10 flex flex-col items-center">
                <span className="text-xs font-semibold text-foreground mb-1">
                  {uploadItem.progress}%
                </span>
              </div>

              {/* Thanh tiến trình chạy ngang dưới đáy */}
              <div
                className="absolute bottom-0 left-0 h-1.5 bg-primary transition-all duration-300 ease-out"
                style={{ width: `${uploadItem.progress}%` }}
              />

              {/* Nền mờ ảo bên dưới file chạy từ trên xuống để tạo cảm giác loading */}
              <div
                className="absolute top-0 left-0 w-full bg-primary/10 transition-all duration-300"
                style={{ height: `${100 - uploadItem.progress}%` }}
              />
            </div>
          ))}

          {/* 3. Nút thêm file phụ */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-border hover:bg-secondary/50 flex cursor-pointer aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors"
          >
            <Plus className="text-muted-foreground mb-1 h-6 w-6" />
            <span className="text-muted-foreground text-xs font-medium">
              Thêm file
            </span>
          </div>
        </div>
      )}

      <MediaLightbox
        isOpen={isOpenMediaLightBox}
        onOpenChange={handleOpenChange}
        media={media}
        initialIndex={currentIndex}
        className="top-0 right-0 bottom-0 left-0 flex h-screen max-w-none! translate-x-0 translate-y-0"
      />
    </div>
  );
}