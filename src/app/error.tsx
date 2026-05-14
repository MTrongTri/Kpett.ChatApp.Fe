"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20 text-center">
            <div className="border-border/70 bg-card/70 mb-8 flex h-28 w-28 items-center justify-center rounded-full">
                <div className="bg-destructive/10 text-destructive flex h-full w-full items-center justify-center rounded-full">
                    <AlertTriangle className="h-9 w-9" strokeWidth={1.8} />
                </div>
            </div>

            <p className="text-destructive text-sm font-bold tracking-[0.24em] uppercase">
                Lỗi hệ thống
            </p>

            <h1 className="mt-4 text-[56px] leading-none font-extrabold tracking-tight select-none sm:text-[88px]">
                500
            </h1>

            <h2 className="text-foreground mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                Đã có lỗi xảy ra
            </h2>

            <p className="text-muted-foreground mx-auto mt-4 max-w-135 text-[15px] leading-relaxed">
                Yêu cầu của bạn chưa thể hoàn tất. Bạn có thể thử tải lại tác vụ hoặc
                quay về bảng tin trong lúc hệ thống xử lý sự cố.
            </p>

            {process.env.NODE_ENV === "development" && (
                <div className="border-destructive/20 bg-destructive/5 mt-6 max-h-44 w-full max-w-2xl overflow-auto rounded-xl border p-4 text-left">
                    <p className="text-destructive mb-2 text-xs font-semibold tracking-widest uppercase">
                        Development error
                    </p>
                    <pre className="text-foreground/80 font-mono text-xs whitespace-pre-wrap">
                        {error.message}
                    </pre>
                    {error.digest && (
                        <p className="text-muted-foreground mt-3 text-xs">
                            Digest: {error.digest}
                        </p>
                    )}
                </div>
            )}

            <div className="mt-10 flex w-full max-w-sm flex-col items-center gap-4 sm:max-w-none sm:flex-row sm:justify-center">
                <Button
                    onClick={reset}
                    className="h-12 w-full rounded-full px-8! text-[14px] font-semibold transition-all hover:scale-105 sm:w-auto"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Thử lại
                </Button>

                <Button
                    asChild
                    variant="outline"
                    className="border-border/60 hover:bg-muted h-12 w-full rounded-full px-8! text-[14px] font-semibold transition-all sm:w-auto"
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
