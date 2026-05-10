"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { UserAvatar } from "@/components/user/user-avatar";
import { getFriendSuggestions } from "@/services/friend.service";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function SuggestionsCard() {
    const { user } = useAuth();

    const { data: suggestions = [], isLoading } = useQuery({
        queryKey: ["friend-suggestions"],
        queryFn: () => getFriendSuggestions(5),
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });

    if (!user) return null;

    if (!isLoading && suggestions.length === 0) {
        return (
            <div className="border-border bg-card space-y-6 rounded-xl border p-4 text-center text-muted-foreground text-sm">
                Không có gợi ý nào.
            </div>
        );
    }

    return (
        <div className="border-border bg-card space-y-6 rounded-xl border p-4">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full shrink-0"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                            <div className="h-2 bg-muted rounded w-1/2"></div>
                        </div>
                    </div>
                ))
            ) : (
                suggestions.map((suggestion) => {
                    return (
                        <div key={suggestion.id} className="flex items-center justify-between group">
                            <Link href={`/${suggestion.username}`} className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                                <UserAvatar user={suggestion} className="w-10 h-10 shrink-0" />
                                <div className="truncate">
                                    <div className="text-card-foreground truncate text-[13px] leading-tight font-semibold">
                                        {suggestion.displayName || suggestion.username}
                                    </div>
                                    <div className="text-foreground/40 mt-0.5 truncate text-[11px]">
                                        @{suggestion.username}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    );
                })
            )}
        </div>
    );
}