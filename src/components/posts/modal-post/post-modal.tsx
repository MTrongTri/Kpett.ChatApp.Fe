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
export interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  postId?: string | null;
}

const steps = [
  {
    title: "Nội dung",
    step: 0
  },
  {
    title: "Media",
    step: 1
  },
  {
    title: "Settings",
    step: 2
  },
];

export default function PostModal({
  open,
  onOpenChange,
  mode,
  postId,
}: PostModalProps) {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);

  const router = useRouter();
  const pathname = usePathname()

  // --- SWR FETCHING ---
  const {
    data: postData,
    error: fetchError,
    isLoading: isFetchingSWR,
  } = useSWR(
    open && isEdit && postId ? `/api/posts/${postId}` : null,
    () => getPostById(postId!),
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
        // Reset state sạch sẽ khi tạo bài mới
        setContent("");
        setPrivacy("public");
        setAllowComments(true);
        setMedia([]);
        setStep(0);
        setDone(false);
      } else if (mode === "edit" && postData) {
        // Gán data vào state khi SWR tải xong
        const { data } = postData;

        setContent(data?.content || "");
        setPrivacy(data?.privacy || "public");
        setAllowComments(true);
        setMedia(data?.media || []);
      }
    }
  }, [open, mode, postData]);

  // Logic kiểm tra điều kiện nút Next/Submit
  const canSubmit = (content.trim().length > 0 || media.length > 0) && !isFetchingSWR;

  const handleSubmit = async () => {
    setSub(true);

    const res = mode === "create" ? await createPost({
      content,
      privacy,
      media
    }) : await updatePost(postId!, {
      content,
      privacy,
      media
    });

    setSub(false);
    setDone(true);

    await delay(1600);
    onOpenChange(false);

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

  const composeProps = {
    content,
    setContent,
    privacy,
    setPrivacy,
  };

  // Trạng thái đang tải dữ liệu để edit
  const isPageLoading = isEdit && isFetchingSWR;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border gap-0 overflow-hidden p-0 shadow-2xl sm:max-w-160 md:max-w-[70vw]">
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
                } ${step === s.step
                  ? "text-primary"
                  : "text-foreground"
                }`}
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
          {/* Trạng thái 1: Đang Fetch Data */}
          {isPageLoading && (
            <div className="flex h-full min-h-[30vh] flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Đang tải thông tin bài viết...</p>
            </div>
          )}

          {/* Trạng thái 2: Lỗi Fetch Data */}
          {!isPageLoading && fetchError && isEdit && (
            <div className="flex h-full min-h-[30vh] flex-col items-center justify-center gap-3 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm font-medium">Không thể tải dữ liệu bài viết.</p>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
            </div>
          )}

          {/* Trạng thái 3: Hiển thị Form khi load xong (hoặc là mode Create) */}
          {!isPageLoading && !fetchError && !done && (
            <>
              {/* Tối ưu render: Giữ các tab trong DOM bằng CSS toggle */}
              <div className={step === 0 ? "block h-full" : "hidden"}>
                <StepCompose props={composeProps} />
              </div>

              <div className={step === 1 ? "block h-full" : "hidden"}>
                <StepMedia
                  media={media}
                  setMedia={setMedia}
                  onLoadingChange={setUploadMediaLoading}
                />
              </div>

              <div className={step === 2 ? "block h-full" : "hidden"}>
                <StepSettings
                  content={content}
                  media={media}
                  allowComments={allowComments}
                  setAllowComments={setAllowComments}
                />
              </div>
            </>
          )}

          {/* Success State */}
          {done && (
            <div className="bg-background/95 animate-in fade-in absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm duration-300">
              <div className="bg-primary/20 text-primary mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Check className="h-8 w-8 stroke-3" />
              </div>
              <h3 className="text-2xl font-bold">
                {isEdit ? "Đã cập nhật!" : "Đã đăng bài!"}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Xử lý thành công. Cửa sổ sẽ tự đóng...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-border bg-muted/10 flex items-center justify-between border-t px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs">
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
                className="min-w-35 cursor-pointer rounded-full"
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
      </DialogContent>
    </Dialog>
  );
}