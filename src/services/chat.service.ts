import http from '@/lib/axios';
import {
    ConversationResponse,
    MessageResponse,
} from '@/types/chat';
import { ApiResponse, PaginatedData } from '@/types/common/api';

// URL chỉ cần /conversations vì axios baseURL đã có sẵn /api
const API_URL = '/conversations';

export const chatService = {
    // Lấy danh sách cuộc hội thoại
    getConversations: async (limit = 12, cursor?: string): Promise<PaginatedData<ConversationResponse>> => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);

        const response = await http.get<any, ApiResponse<PaginatedData<ConversationResponse>>>(
            `${API_URL}?${params.toString()}`
        );

        return response.data!;
    },

    // Lấy danh sách tin nhắn trong một cuộc hội thoại
    getMessages: async (conversationId: string, limit = 20, cursor?: string): Promise<PaginatedData<MessageResponse>> => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cursor) params.append('cursor', cursor);

        const response = await http.get<any, ApiResponse<PaginatedData<MessageResponse>>>(
            `${API_URL}/${conversationId}/messages?${params.toString()}`
        );

        return response.data!;
    },

    // Gửi tin nhắn mới
    sendMessage: async (conversationId: string, content: string, type: string = "Text", clientMessageId: string): Promise<MessageResponse> => {
        const payload = {
            content,
            type,
            clientMessageId
        };

        const response = await http.post<any, ApiResponse<MessageResponse>>(
            `${API_URL}/${conversationId}/messages`,
            payload
        );

        return response.data!;
    },

    // (Bổ sung thêm) Thêm thành viên vào nhóm
    addMemberToGroup: async (conversationId: string, userIdsToAdd: string[]): Promise<boolean> => {
        const response = await http.post<any, ApiResponse>(
            `${API_URL}/${conversationId}/members`,
            { userIdsToAdd }
        );
        return response.isSuccess;
    },

    // (Bổ sung thêm) Xóa/Rời nhóm
    removeMember: async (conversationId: string, userIdToRemove: string): Promise<boolean> => {
        const response = await http.delete<any, ApiResponse>(
            `${API_URL}/${conversationId}/members/${userIdToRemove}`
        );
        return response.isSuccess;
    },

    // Thêm hàm này vào dưới hàm sendMessage
    markAsRead: async (conversationId: string): Promise<boolean> => {
        try {
            // Lưu ý: Hãy điều chỉnh URL này khớp với Route trong Controller C# của bạn
            const response = await http.put<any, ApiResponse>(
                `${API_URL}/${conversationId}/read`,
                {}
            );
            return response.isSuccess;
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc", error);
            return false;
        }
    },

    getConversationById: async (conversationId: string): Promise<ConversationResponse> => {
        const response = await http.get<any, ApiResponse<ConversationResponse>>(
            `${API_URL}/${conversationId}`
        );

        return response.data!;
    },
};