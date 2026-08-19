"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Play, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile } from "@/services/media.service";
import { createPost } from "@/services/post.service";
import { toast } from "sonner";

export default function CreateReelPage() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn file video");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video Reel không được vượt quá 100MB");
      return;
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  }, []);

  const handleRemoveVideo = useCallback(() => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [videoPreview]);

  const handlePublish = async () => {
    if (!videoFile) {
      toast.error("Vui lòng chọn video");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploaded = await uploadFile(videoFile, "reels", (progress) => {
        setUploadProgress(progress);
      });

      await createPost({
        content: caption,
        privacy: "public",
        type: "Reel",
        media: [
          {
            publicId: uploaded.publicId,
            url: uploaded.url,
            type: "video",
          },
        ],
        allowComments: true,
      });

      toast.success("Đã đăng Reel thành công!");
      router.push("/reels");
    } catch (err) {
      toast.error("Đăng Reel thất bại, vui lòng thử lại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="flex items-center justify-between px-4 py-3">
        <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-white/10">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-bold">Tạo Reel mới</h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        {!videoPreview ? (
          <label className="flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-white/20 p-12 transition-all hover:border-white/40 hover:bg-white/5">
            <div className="rounded-full bg-white/10 p-6">
              <Play className="h-12 w-12 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Chọn video để tải lên</p>
              <p className="mt-1 text-sm text-white/50">Hỗ trợ MP4, WebM, MOV (tối đa 100MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        ) : (
          <div className="flex w-full max-w-md flex-col gap-4">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-black">
              <video
                src={videoPreview}
                className="h-full w-full object-contain"
                controls
                playsInline
              />
              <button
                onClick={handleRemoveVideo}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white backdrop-blur-sm hover:bg-black/80"
              >
                <Trash2 className="h-5 w-5" />
              </button>

              {uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Loader2 className="mb-3 h-8 w-8 animate-spin text-white" />
                  <p className="text-sm font-medium">Đang tải lên...</p>
                  <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Textarea
              placeholder="Thêm mô tả cho Reel của bạn..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[80px] resize-none rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/40"
              maxLength={500}
            />

            <Button
              onClick={handlePublish}
              disabled={uploading}
              className="w-full rounded-full bg-white py-6 text-base font-bold text-black hover:bg-white/90"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Đăng Reel
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
