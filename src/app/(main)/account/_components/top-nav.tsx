"use client"

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TopNav() {
    const router = useRouter();

    return (
        <header
            className="
        sticky top-0 z-40 h-13.5
        flex items-center justify-between px-5
        border-b border-border
        bg-background/94 backdrop-blur-xl
      "
        >
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
