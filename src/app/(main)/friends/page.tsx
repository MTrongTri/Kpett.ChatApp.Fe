"use client"

import Link from "next/link";
import { ArrowLeft, Home, Settings, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function FriendsPage() {
    const router = useRouter();

    return (
        <div className="mt-14.5 flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-background px-6 text-center">

            <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-muted/20 ring-1 ring-border/50">
                <Settings className="absolute h-16 w-16 text-muted-foreground/30 animate-[spin_4s_linear_infinite]" strokeWidth={1} />
                <Wrench className="relative z-10 h-10 w-10 text-foreground" strokeWidth={1.5} />

                <span className="absolute right-4 top-4 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                </span>
            </div>

            <h1 className="select-none bg-linear-to-br from-foreground to-muted-foreground/50 bg-clip-text text-[40px] font-extrabold tracking-tight text-transparent sm:text-[56px]">
                Đang Phát Triển
            </h1>

            <h2 className="mt-3 text-lg font-medium text-foreground sm:text-xl">
                Tính năng này sắp ra mắt
            </h2>

            <p className="mx-auto mt-4 max-w-125 text-[15px] leading-relaxed text-muted-foreground">
                Đội ngũ của chúng tôi đang miệt mài gõ phím để đưa tính năng này đến tay bạn trong thời gian sớm nhất. Quá trình nâng cấp hệ thống đang diễn ra, vui lòng quay lại sau nhé!
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="h-12 w-full rounded-full border-border/60 px-8! text-[14px] font-semibold transition-all hover:bg-muted sm:w-auto"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>

                <Button
                    asChild
                    className="h-12 w-full rounded-full px-8! text-[14px] font-semibold transition-all hover:scale-105 sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
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