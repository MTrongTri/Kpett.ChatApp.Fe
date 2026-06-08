"use client";

import { useCallback, useEffect } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { NotificationToast } from "@/components/notification/notification-toast";
import { useSignalR } from "@/components/providers/signalr-provider";
import { notificationService } from "@/services/notification.service";
import { NotificationResponse } from "@/types/notification";
import { getNotificationSoundKey, playSound } from "@/lib/notification-sound";

export function useNotifications(isFetch: boolean = false) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { connection, isConnected } = useSignalR();

  const getNotificationText = useCallback((notification: NotificationResponse) => {
    switch (notification.type) {
      case "FriendRequestReceived":
        return "da gui cho ban mot loi moi ket ban.";
      case "FriendRequestAccepted":
        return "da chap nhan loi moi ket ban cua ban.";
      case "CommentMention":
        return "da nhac den ban trong mot binh luan.";
      default:
        return "da tuong tac voi ban.";
    }
  }, []);

  const notificationsQuery = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      notificationService.getNotifications(20, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor || undefined,
    enabled: !!user && isFetch,
  });

  const unreadCountQuery = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!connection || !isConnected) {
      return;
    }

    const handleReceiveNotification = (newNotification: NotificationResponse) => {
      toast.custom(
        (toastInstance) => (
          <NotificationToast
            toastId={toastInstance}
            notification={newNotification}
            text={getNotificationText(newNotification)}
          />
        ),
        {
          id: newNotification.id,
          duration: 4000,
        },
      );

      if (newNotification.sound?.enabled !== false) {
        playSound(
          newNotification.sound?.key ?? getNotificationSoundKey(newNotification.type),
          newNotification.sound?.volume,
        );
      }

      queryClient.setQueryData(["notifications-unread"], (oldCount: number = 0) => {
        return oldCount + 1;
      });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (
        newNotification.type === "FriendRequestAccepted" ||
        newNotification.type === "FriendRequestReceived"
      ) {
        void queryClient.invalidateQueries({
          queryKey: ["user-profile", newNotification.actor?.username],
        });
        void queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
      }
    };

    connection.on("ReceiveNotification", handleReceiveNotification);

    return () => {
      connection.off("ReceiveNotification", handleReceiveNotification);
    };
  }, [connection, getNotificationText, isConnected, queryClient]);

  return {
    ...notificationsQuery,
    notifications: notificationsQuery.data?.pages.flatMap((page) => page.items) || [],
    unreadCount: unreadCountQuery.data || 0,
    getNotificationText,
  };
}
