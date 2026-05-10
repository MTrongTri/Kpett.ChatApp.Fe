import http from "@/lib/axios";
import { PaginatedData } from "@/types/common/api";
import { NotificationResponse } from "@/types/notification";

export const notificationService = {
    getNotifications: async (
        limit: number = 20,
        cursor?: string
    ): Promise<PaginatedData<NotificationResponse>> => {
        const response = await http.get<PaginatedData<NotificationResponse>>(
            `notifications`,
            { params: { limit, cursor } }
        );
        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await http.get<number>(`notifications/unread-count`);
        return response.data;
    },

    markAsRead: async (notificationId: string): Promise<void> => {
        await http.put(`notifications/${notificationId}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await http.put(`notifications/read-all`);
    },
};