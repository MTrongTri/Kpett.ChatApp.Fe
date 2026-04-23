import { Button } from "@/components/ui/button";
import { useMediaLightbox } from "@/hooks/post/use-media-lightbox";
import { compressImageClientSide, validateFile } from "@/lib/file-utils";
import { deleteFile, uploadFileToCloudinary } from "@/services/media.service";
import { Media } from "@/types/media";
import axios from "axios";
import { Loader2, Play, Plus, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { MediaLightbox } from "../media-lightbox";
import { useDispatch } from "react-redux";
import { openMediaLightBox } from "@/store/features/modal-slice";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary-utils";

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  abortController: AbortController;
  previewUrl: string;
}

interface MediaUploaderProps {
  media: Media[];
  onChange: (media: Media[]) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function MediaUploader({ media, onChange, onLoadingChange }: MediaUploaderProps) {
  const dispatch = useDispatch();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const latestMediaRef = useRef(media);
  const successfullyDeletedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    latestMediaRef.current = media;
  }, [media]);

  const isUploading = uploadQueue.length > 0;
  const isDeleting = deletingIds.length > 0;
  const isBusy = useMemo(() => isUploading || isDeleting, [isUploading, isDeleting]);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isBusy);
    }
  }, [isBusy, onLoadingChange]);

  // Giải phóng bộ nhớ RAM từ các URL tạm thời khi component unmount
  useEffect(() => {
    return () => {
      uploadQueue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tách riêng logic xử lý file để dùng chung cho Click và Drag&Drop
  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const validFiles: File[] = [];

    for (const file of files) {
      const validation = validateFile(file, {
        allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "video/quicktime"],
        maxVideoSize: 100 * 1024 * 1024,
        maxImageSize: 5 * 1024 * 1024,
      });

      if (!validation.isValid) {
        toast.error(`File ${file.name}: ${validation.error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          try {
            return await compressImageClientSide(file, {

            });
          } catch (error) {
            console.error("Lỗi nén file:", file.name, error);
            return file;
          }
        })
      );

      const newQueueItems: UploadingFile[] = processedFiles.map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
        progress: 0,
        abortController: new AbortController(),
        previewUrl: URL.createObjectURL(file), // Tạo URL xem trước
      }));

      setUploadQueue((prev) => [...prev, ...newQueueItems]);

      const uploadPromises = newQueueItems.map(async (queueItem) => {
        try {
          const result = await uploadFileToCloudinary(
            queueItem.file,
            "posts",
            (percent) => {
              setUploadQueue((currentQueue) =>
                currentQueue.map((item) =>
                  item.id === queueItem.id ? { ...item, progress: percent } : item
                )
              );
            },
            queueItem.abortController.signal
          );
          return { success: true, item: queueItem, result, canceled: false };
        } catch (error: any) {
          // Bắt lỗi hủy từ Axios chuẩn xác
          const isCanceled = axios.isCancel(error);
          return { success: false, item: queueItem, error, canceled: isCanceled };
        }
      });

      const results = await Promise.allSettled(uploadPromises);

      const successfulUploads: Media[] = [];
      const completedIds: string[] = [];
      let hasError = false;

      results.forEach((res) => {
        if (res.status === "fulfilled") {
          const { item, success, result, canceled, error } = res.value;
          completedIds.push(item.id);

          if (success) {
            successfulUploads.push(result!);
          } else if (!canceled) {
            console.error("Lỗi upload file:", item.file.name, error);
            hasError = true;
          }

          // Xóa preview URL khỏi RAM khi xử lý xong
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      if (hasError) {
        toast.error("Một số file tải lên thất bại do lỗi mạng hoặc quá dung lượng.");
      }

      if (successfulUploads.length > 0) {
        const updatedMedia = [...latestMediaRef.current, ...successfulUploads];
        onChange(updatedMedia);
        latestMediaRef.current = updatedMedia;
      }

      setUploadQueue((currentQueue) =>
        currentQueue.filter((item) => !completedIds.includes(item.id))
      );
    } catch (error) {
      console.error("Lỗi xử lý file:", error);
      toast.error("Đã có lỗi bất ngờ xảy ra khi xử lý file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
  };

  // --- Các hàm hỗ trợ Drag & Drop ---
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ------------------------------------

  const handleCancelUpload = (id: string) => {
    setUploadQueue((prev) => {
      const itemToCancel = prev.find((item) => item.id === id);
      if (itemToCancel) {
        itemToCancel.abortController.abort();
        URL.revokeObjectURL(itemToCancel.previewUrl); // Cleanup RAM
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleRemove = async (itemToRemove: Media) => {
    try {
      setDeletingIds((prev) => [...prev, itemToRemove.publicId]);

      await deleteFile(itemToRemove.publicId, itemToRemove.type);

      successfullyDeletedIdsRef.current.add(itemToRemove.publicId);

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

      {/* <div className="text-muted-foreground mb-3 text-[11px]">
        Chọn ảnh/video hoặc kéo thả trực tiếp vào đây (Hỗ trợ JPG, PNG, MP4, WEBM).
      </div> */}

      {media.length === 0 && !isUploading ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-border flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200
            ${isDragging ? "bg-primary/10 border-primary" : "hover:bg-secondary/50"}`}
        >
          <div className={`${isDragging ? "bg-primary/20 scale-110" : "bg-secondary/80"} mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-transform`}>
            <UploadCloud className="text-primary h-7 w-7" />
          </div>
          <p className="text-foreground text-sm font-semibold">
            {isDragging ? "Thả file vào đây để tải lên" : "Nhấn hoặc Kéo thả ảnh/video vào đây"}
          </p>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Hiển thị các file ĐÃ UPLOAD XONG */}
          {media.map((item, index) => {
            const isDeletingItem = deletingIds.includes(item.publicId);

            return (
              <div
                key={item.publicId}
                className="border-border group relative flex w-full h-100 items-center justify-center rounded-xl overflow-hidden border bg-black/5"
              >
                {isDeletingItem && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {item.type === "video" ? (
                  <div
                    className="group/video relative h-full w-full cursor-pointer bg-black"
                    onClick={() => dispatch(openMediaLightBox({ media, index }))}
                  >
                    <video src={getOptimizedCloudinaryUrl(item.url)} className="h-full w-full object-contain" preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all group-hover/video:bg-black/25">
                      <Play className="h-14 w-14 text-white opacity-90 drop-shadow-lg transition-transform duration-200 group-hover/video:scale-110" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={getOptimizedCloudinaryUrl(item.url)}
                    alt="Uploaded"
                    className="h-full w-full object-cover cursor-pointer"
                    onClick={() => dispatch(openMediaLightBox({ media, index }))}
                  />
                )}

                <Button
                  variant="destructive"
                  size="icon"
                  disabled={isDeletingItem}
                  className={`absolute top-2 right-2 z-20 h-7 w-7 rounded-full shadow-md transition-opacity 
                    ${isDeletingItem ? "opacity-100 cursor-not-allowed" : "opacity-0 group-hover:opacity-100"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {/* Hiển thị các file ĐANG UPLOAD */}
          {uploadQueue.map((uploadItem) => (
            <div
              key={uploadItem.id}
              // Tương tự, đồng bộ kích thước "max-w-[320px] w-full" cho file đang upload
              className="border-border group relative flex w-full h-100 flex-col items-center justify-center overflow-hidden rounded-xl border bg-secondary/30"
            >
              {uploadItem.file.type.startsWith("image/") ? (
                <img src={uploadItem.previewUrl} alt="Preview" className="absolute inset-0 h-full w-full object-cover opacity-40 blur-[2px]" />
              ) : (
                <video src={uploadItem.previewUrl} className="absolute inset-0 h-full w-full object-cover opacity-40 blur-[2px]" />
              )}

              <div className="absolute inset-0 bg-black/20" />

              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full shadow-md opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelUpload(uploadItem.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="z-10 flex flex-col items-center drop-shadow-md">
                <span className="text-xl font-bold text-white mb-1">
                  {uploadItem.progress}%
                </span>
                <span className="text-xs text-white/90 font-medium bg-black/40 px-3 py-1 rounded-full">Đang tải lên...</span>
              </div>

              <div
                className="absolute bottom-0 left-0 h-1.5 bg-primary transition-all duration-300 ease-out z-10"
                style={{ width: `${uploadItem.progress}%` }}
              />
            </div>
          ))}

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`mb-6 border-border flex cursor-pointer w-full max-w-[320px] flex-row gap-2 py-4 items-center justify-center rounded-xl border-2 border-dashed transition-colors
               ${isDragging ? "bg-primary/10 border-primary" : "hover:bg-secondary/50"}`}
          >
            <Plus className="text-muted-foreground h-5 w-5" />
            <span className="text-muted-foreground text-sm font-medium">
              Thêm file khác
            </span>
          </div>
        </div>
      )}
    </div>
  );
}