"use client";

import { useEffect } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { NotificationResponse } from "@/types/notification";
import { useAuth } from "@/components/providers/auth-provider";
import { useSignalR } from "@/components/providers/signalr-provider";
import { toast } from "sonner";
import { NotificationToast } from "@/components/notification/notification-toast";

export function useNotifications(isFetch: boolean = false) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { connection, isConnected } = useSignalR();

    // Fetch danh sách thông báo
    const notificationsQuery = useInfiniteQuery({
        queryKey: ["notifications"],
        queryFn: ({ pageParam }) => notificationService.getNotifications(20, pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor || undefined,
        enabled: !!user && isFetch,
    });

    // Fetch số lượng chưa đọc (Unread Count)
    const unreadCountQuery = useQuery({
        queryKey: ["notifications-unread"],
        queryFn: () => notificationService.getUnreadCount(),
        enabled: !!user,
    });

    // Lắng nghe sự kiện từ SignalR dùng chung
    useEffect(() => {
        if (!connection || !isConnected) return;

        const handleReceiveNotification = (newNotif: NotificationResponse) => {
            toast.custom((t) => <NotificationToast
                toastId={t}
                notification={newNotif}
                text={getNotificationText(newNotif)}
            />, {
                id: newNotif.id,
                duration: 4000,
            });

            // Tăng biến đếm chưa đọc lên 1
            queryClient.setQueryData(["notifications-unread"], (old: number = 0) => old + 1);
            queryClient.invalidateQueries({ queryKey: ["notifications"] });

            if (newNotif.type === "FriendRequestAccepted" || newNotif.type === "FriendRequestReceived") {
                queryClient.invalidateQueries({ queryKey: ["user-profile", newNotif.actor?.username] });
            }
        };

        // Đăng ký sự kiện
        connection.on("ReceiveNotification", handleReceiveNotification);

        return () => {
            connection.off("ReceiveNotification", handleReceiveNotification);
        };
    }, [connection, isConnected, queryClient]);

    const getNotificationText = (n: NotificationResponse) => {
        switch (n.type) {
            case "FriendRequestReceived": return "đã gửi cho bạn một lời mời kết bạn.";
            case "FriendRequestAccepted": return "đã chấp nhận lời mời kết bạn của bạn.";
            case "CommentMention": return `đã nhắc đến bạn trong một bình luận`;
            default: return "đã tương tác với bạn.";
        }
    };

    return {
        ...notificationsQuery,
        notifications: notificationsQuery.data?.pages.flatMap((p) => p.items) || [],
        unreadCount: unreadCountQuery.data || 0,
        getNotificationText,
    };
}