"use client";

import { cn } from "@/lib/utils";

interface ChatMessageListSkeletonProps {
    compact?: boolean;
    count?: number;
}

const bubbleRows = [
    { align: "start", width: "w-42" },
    { align: "end", width: "w-52" },
    { align: "start", width: "w-60" },
    { align: "end", width: "w-36" },
    { align: "start", width: "w-48" },
    { align: "end", width: "w-56" },
] as const;

export function ChatMessageListSkeleton({ compact = false, count = 6 }: ChatMessageListSkeletonProps) {
    return (
        <div className={cn("space-y-4", compact && "space-y-3")}>
            {bubbleRows.slice(0, count).map((row, index) => (
                <div
                    key={`${row.align}-${index}`}
                    className={cn("flex animate-pulse", row.align === "end" ? "justify-end" : "justify-start")}
                >
                    <div className={cn("flex max-w-[78%] items-end gap-2", row.align === "end" && "flex-row-reverse")}>
                        {row.align === "start" && (
                            <div className={cn("shrink-0 rounded-full bg-muted", compact ? "h-6 w-6" : "h-8 w-8")} />
                        )}
                        <div
                            className={cn(
                                "rounded-2xl bg-muted",
                                compact ? "h-8" : "h-10",
                                row.width
                            )}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
