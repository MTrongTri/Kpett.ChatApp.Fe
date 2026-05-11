"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="select-none bg-linear-to-br from-foreground to-muted-foreground/30 bg-clip-text text-[140px] font-extrabold leading-none tracking-tighter text-transparent sm:text-[180px]">
        404
      </h1>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Không tìm thấy nội dung
      </h2>

      <p className="mx-auto mt-5 max-w-125 text-[15px] leading-relaxed text-muted-foreground">
        Đường dẫn bạn truy cập có thể đã bị thay đổi, xóa bỏ hoặc tạm thời không khả dụng. Xin vui lòng kiểm tra lại URL hoặc quay về trang an toàn.
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

      <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-muted-foreground/40 font-medium tracking-widest uppercase">
        Kpett.ChatApp System
      </div>
    </div>
  );
}