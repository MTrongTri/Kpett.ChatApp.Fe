"use client";

import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user/user-avatar";
import { useNotifications } from "@/hooks/notification/use-notifications";
import { formatRelativeTime } from "@/lib/format-date-utils";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState } from "react";
import clsx from "clsx";

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);

    const queryClient = useQueryClient();
    const {
        notifications,
        unreadCount,
        getNotificationText,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage
    } = useNotifications(isOpen);

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await notificationService.markAsRead(id);
            queryClient.setQueryData(["notifications-unread"], (old: number) => Math.max(0, old - 1));
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        } catch { }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            queryClient.setQueryData(["notifications-unread"], 0);
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        } catch { }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className={clsx(
                    "relative p-2.5 rounded-full transition-colors cursor-pointer",
                    isOpen ? "bg-primary/10 text-primary" : "bg-muted text-foreground hover:bg-muted/80"
                )}>
                    <Bell size={22} />
                    {/* Badge đếm số */}
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="z-100 flex max-h-[calc(100dvh-5rem)] w-[calc(100vw-1.5rem)] max-w-90 flex-col overflow-hidden rounded-2xl border-border bg-card p-0 shadow-xl">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
                    <h3 className="shrink-0 font-bold text-lg">Thông báo</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto min-h-8 min-w-0 whitespace-normal px-2 py-1 text-right text-xs leading-tight text-primary hover:text-primary/80">
                            <Check size={14} className="mr-1" /> Đánh dấu đã đọc
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-100 max-h-[calc(100dvh-9rem)] min-h-0">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">Chưa có thông báo nào.</div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => {
                                // Tạo link click dựa vào loại thông báo
                                let link = "#";
                                if (n.type.includes("Friend")) link = `/${n.actor?.username}`;
                                if (n.type === "CommentMention") link = `/post/${n.referenceId}`;

                                return (
                                    <Link
                                        href={link}
                                        key={n.id}
                                        onClick={() => {
                                            handleMarkAsRead(n.id, n.isRead);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/30",
                                            !n.isRead ? "bg-primary/5" : ""
                                        )}
                                    >
                                        <UserAvatar user={{ avatarUrl: n.actor?.avatarUrl, displayName: n.actor?.displayName || "", username: n.actor?.username || "", id: n.actor?.id || "" }} className="w-12 h-12 shrink-0" />
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <p className="text-sm text-foreground line-clamp-3 leading-snug">
                                                <span className="font-bold mr-1">{n.actor?.displayName}</span>
                                                {getNotificationText(n)}
                                            </p>
                                            <span className="text-xs text-primary font-medium mt-1">
                                                {formatRelativeTime(n.createdAt)}
                                            </span>
                                        </div>
                                        {!n.isRead && <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-2" />}
                                    </Link>
                                );
                            })}

                            {hasNextPage && (
                                <Button
                                    variant="ghost"
                                    className="w-full rounded-none py-4 text-xs text-muted-foreground"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage ? <Loader2 className="animate-spin" size={14} /> : "Xem thêm"}
                                </Button>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
