"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Check, Loader2, Save, Send, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import useSWR from "swr";

import { Media } from "@/types/media";
import StepCompose from "./step-compose";
import StepMedia from "./step-media";
import StepSettings from "./step-setting";
import { createPost, getPostById, updatePost } from "@/services/post.service";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { usePathname, useRouter } from "next/navigation";
import { delay } from "@/lib/delay-utils";

// --- ĐỊNH NGHĨA PROPS ---
export type PostEditorMode = "create" | "edit";

export interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: PostEditorMode;
  postId?: string | null;
}

const steps = [
  { title: "Nội dung", step: 0 },
  { title: "Media", step: 1 },
  { title: "Settings", step: 2 },
];

export default function PostEditor({
  open,
  onOpenChange,
  mode,
  postId,
}: PostModalProps) {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  // --- SWR FETCHING ---
  const {
    data: postData,
    error: postError,
    isLoading: isFetchingSWR,
  } = useSWR(
    open && isEdit && postId ? `/api/posts/${postId}` : null,
    () => getPostById(postId!).then((res) => res.data),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // States
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [allowComments, setAllowComments] = useState(true);
  const [media, setMedia] = useState<Media[]>([]);

  const [uploadMediaLoading, setUploadMediaLoading] = useState(false);
  const [submitting, setSub] = useState(false);
  const [done, setDone] = useState(false);

  // --- ĐỒNG BỘ DỮ LIỆU SWR VÀO STATE ---
  useEffect(() => {
    if (open) {
      if (mode === "create") {
        setContent("");
        setPrivacy("public");
        setAllowComments(true);
        setMedia([]);
        setStep(0);
        setDone(false);
      } else if (mode === "edit" && postData) {
        setContent(postData?.content || "");
        setPrivacy(postData?.privacy || "public");
        setAllowComments(true);
        setMedia(postData?.media || []);
      }
    }
  }, [open, mode, postData]);

  const canSubmit = (content.trim().length > 0 || media.length > 0) && !isFetchingSWR;

  const handleSubmit = async () => {
    setSub(true);

    if (mode === "create") {
      await createPost({ content, privacy, media });
    } else {
      await updatePost(postId!, { content, privacy, media });
    }

    setSub(false);
    setDone(true); // Kích hoạt UI thành công

    // Giữ UI thành công trong 1.6 giây cho người dùng đọc
    await delay(1600);
    onOpenChange(false);

    // Đợi hiệu ứng đóng modal hoàn tất rồi mới reset state
    await delay(300);
    setDone(false);
    setStep(0);

    const targetPath = `/${user?.username}`;
    const targetUrlWithQuery = `${targetPath}?scroll-to=tabs`;
    if (pathname === targetPath) {
      window.location.href = targetUrlWithQuery;
    } else {
      router.push(`${targetPath}?scroll-to=tabs`);
    }
  };

  const composeProps = { content, setContent, privacy, setPrivacy };
  const isPageLoading = isEdit && isFetchingSWR;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border gap-0 overflow-hidden p-0 shadow-2xl sm:max-w-160 md:max-w-[70vw]">

        {/* === PHÂN NHÁNH RENDER CHÍNH === */}
        {done ? (
          // TRẠNG THÁI 1: CHỈ HIỂN THỊ UI HOÀN THÀNH
          <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
            <div className="bg-primary/10 text-primary mb-6 flex h-20 w-20 items-center justify-center rounded-full">
              <Check className="h-10 w-10 stroke-[3px]" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Đã cập nhật bài viết!" : "Đã đăng bài thành công!"}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Cửa sổ sẽ tự động đóng trong giây lát...
            </p>
          </div>
        ) : (
          // TRẠNG THÁI 2: HIỂN THỊ GIAO DIỆN EDITOR BÌNH THƯỜNG
          <>
            {/* Header */}
            <DialogHeader className="border-border border-b px-6 py-4">
              <DialogTitle className="text-xl">
                {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
              </DialogTitle>
              <DialogDescription className="text-[11px]">
                {isEdit
                  ? "Cập nhật nội dung bài viết của bạn"
                  : "Chia sẻ khoảnh khắc với mọi người"}
              </DialogDescription>
            </DialogHeader>

            {/* Custom Tabs Bar */}
            <div className="border-border bg-muted/20 flex border-b px-6">
              {steps.map((s) => (
                <button
                  key={s.step}
                  onClick={() => setStep(s.step)}
                  disabled={isPageLoading}
                  className={`relative flex items-center gap-2 px-4 py-3 text-[12px] font-bold transition-colors ${!isPageLoading ? "cursor-pointer" : "cursor-default opacity-50"
                    } ${step === s.step ? "text-primary" : "text-foreground"}`}
                >
                  {s.title}
                  {step === s.step && (
                    <span className="bg-primary absolute right-0 bottom-0 left-0 h-0.5 rounded-t-sm" />
                  )}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="relative max-h-[60vh] min-h-[40vh] overflow-y-auto p-6">

              {isPageLoading && (
                <div className="flex h-full min-h-[30vh] flex-col items-center justify-center gap-3 text-muted-foreground animate-in fade-in">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm">Đang tải thông tin bài viết...</p>
                </div>
              )}

              {!isPageLoading && postError && isEdit && (
                <div className="flex h-full min-h-[30vh] flex-col items-center justify-center gap-3 text-destructive animate-in fade-in">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm font-medium">Không thể tải dữ liệu bài viết.</p>
                  <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                    Đóng cửa sổ
                  </Button>
                </div>
              )}

              {!isPageLoading && !postError && (
                <>
                  <div className={step === 0 ? "block h-full animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
                    <StepCompose props={composeProps} />
                  </div>

                  <div className={step === 1 ? "block h-full animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
                    <StepMedia
                      media={media}
                      setMedia={setMedia}
                      onLoadingChange={setUploadMediaLoading}
                    />
                  </div>

                  <div className={step === 2 ? "block h-full animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
                    <StepSettings
                      content={content}
                      media={media}
                      allowComments={allowComments}
                      setAllowComments={setAllowComments}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-border bg-muted/10 flex items-center justify-between border-t px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-xs font-medium">
                  Bước {step + 1}/{steps.length}
                </span>
              </div>

              <div className="flex gap-2">
                {step > 0 && (
                  <Button
                    variant="ghost"
                    className="cursor-pointer px-6"
                    onClick={() => setStep((s) => s - 1)}
                    disabled={isPageLoading || submitting}
                  >
                    Quay lại
                  </Button>
                )}

                {step < steps.length - 1 ? (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    className="cursor-pointer rounded-full px-6!"
                    disabled={isPageLoading}
                  >
                    Tiếp theo <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || submitting || isPageLoading || uploadMediaLoading}
                    className="min-w-35 cursor-pointer rounded-full transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý
                      </>
                    ) : isEdit ? (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Cập nhật
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Đăng bài
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}