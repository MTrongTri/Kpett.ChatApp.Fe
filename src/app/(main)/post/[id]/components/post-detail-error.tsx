import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PostDetailError() {
    return (
        <div className="bg-background min-h-screen pt-14.5">
            <div className="mx-auto flex min-h-[calc(100vh-58px)] w-full max-w-170 items-center justify-center px-4">
                <div className="border-border bg-card flex w-full flex-col items-center rounded-xl border p-8 text-center">
                    <div className="bg-destructive/10 text-destructive mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                        <AlertCircle className="h-7 w-7" />
                    </div>
                    <h1 className="text-foreground text-xl font-bold">
                        Không tìm thấy bài viết
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                        Bài viết này có thể đã bị xóa, bị ẩn hoặc bạn không có quyền truy
                        cập.
                    </p>
                    <Button asChild className="mt-6 rounded-full px-6 font-semibold">
                        <Link href="/">Về bảng tin</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}