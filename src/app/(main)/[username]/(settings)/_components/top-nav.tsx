"use client"

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TopNav({ username }: { username: string }) {
    const router = useRouter();

    return (
        <header
            className="
        sticky top-0 z-40 h-[54px]
        flex items-center justify-between px-5
        border-b border-border
        bg-background/94 backdrop-blur-xl
      "
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/profile/${username}`)}
                className="gap-1.5  text-[11px] uppercase tracking-wider
                   text-foreground/50 hover:text-foreground px-2"
            >
                <ArrowLeft size={14} />
                Trang cá nhân
            </Button>

            {/* Logo */}
            <span
                className="absolute left-1/2 -translate-x-1/2
                   font-bold italic text-[20px] text-primary tracking-tight"
                style={{ fontFamily: "var(--font-fraunces, Georgia, serif)" }}
            >
                VŌ<span className="not-italic font-light text-foreground">ID</span>
            </span>

        </header>
    );
}
