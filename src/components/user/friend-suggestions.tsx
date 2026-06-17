"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/types/user";
import { getFriendSuggestions, friendRequest } from "@/services/friend.service";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";

export function FriendSuggestions() {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});

    const fetchSuggestions = async () => {
        if (!user) return;
        try {
            setIsLoading(true);
            const data = await getFriendSuggestions(5);
            setSuggestions(data);
        } catch (error) {
            console.error("Lỗi khi lấy gợi ý kết bạn", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, [user]);

    const handleAddFriend = async (targetId: string) => {
        try {
            setIsAdding(prev => ({ ...prev, [targetId]: true }));
            await friendRequest(targetId);
            toast.success("Đã gửi lời mời kết bạn");
            // Xóa khỏi danh sách gợi ý sau khi gửi
            setSuggestions(prev => prev.filter(u => u.id !== targetId));
        } catch (error: any) {
            const errorCode = error?.response?.data?.errorCode;
            if (errorCode === 'FRIEND.FRIEND_REQUEST_PENDING') {
                toast.info("Người này đã gửi lời mời kết bạn cho bạn.");
            } else {
                toast.error("Không thể gửi lời mời kết bạn");
            }
        } finally {
            setIsAdding(prev => ({ ...prev, [targetId]: false }));
        }
    };

    if (!user) return null;

    if (!isLoading && suggestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-sm">Gợi ý cho bạn</h3>
                <button 
                    onClick={fetchSuggestions} 
                    disabled={isLoading}
                    className="p-1 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                    title="Tải lại"
                >
                    <RefreshCw size={14} className={`text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-3">
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
                    suggestions.map(suggestion => (
                        <div key={suggestion.id} className="flex items-center justify-between group">
                            <Link href={`/${suggestion.username}`} className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                                <UserAvatar user={suggestion} className="w-10 h-10 shrink-0" />
                                <div className="truncate">
                                    <div className="font-semibold text-sm text-foreground truncate hover:underline">
                                        {suggestion.displayName || suggestion.username}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        @{suggestion.username}
                                    </div>
                                </div>
                            </Link>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 px-3 rounded-full shrink-0 font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                                disabled={isAdding[suggestion.id]}
                                onClick={() => handleAddFriend(suggestion.id)}
                            >
                                {isAdding[suggestion.id] ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus size={14} className="mr-1" />
                                        Thêm
                                    </>
                                )}
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
