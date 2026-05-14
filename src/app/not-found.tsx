import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Không tìm thấy nội dung",
  description:
    "Trang bạn truy cập không tồn tại hoặc đã được di chuyển trên Kpett ChatApp.",
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-6 text-center">
      <h1 className="from-foreground to-muted-foreground/30 bg-linear-to-br bg-clip-text text-[140px] leading-none font-extrabold tracking-tighter text-transparent select-none sm:text-[180px]">
        404
      </h1>

      <h2 className="text-foreground mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Không tìm thấy nội dung
      </h2>

      <p className="text-muted-foreground mx-auto mt-5 max-w-125 text-[15px] leading-relaxed">
        Đường dẫn bạn truy cập có thể đã bị thay đổi, xóa bỏ hoặc tạm thời không
        khả dụng. Xin vui lòng kiểm tra lại URL hoặc quay về trang an toàn.
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Button
          asChild
          className="h-12 w-full rounded-full px-8! text-[14px] font-semibold transition-all hover:scale-105 sm:w-auto"
        >
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Về trang chủ
          </Link>
        </Button>
      </div>

      <div className="text-muted-foreground/40 absolute right-0 bottom-8 left-0 text-center text-xs font-medium tracking-widest uppercase">
        Kpett.ChatApp System
      </div>
    </div>
  );
}
