import http from '@/lib/axios';
import {
    ConversationResponse,
    MessageResponse,
} from '@/types/chat';
import { PaginatedData } from '@/types/common/api';

const API_URL = '/conversations';

export const chatService = {
    // Lấy danh sách cuộc hội thoại
    getConversations: async (limit = 12, cursor?: string): Promise<PaginatedData<ConversationResponse>> => {
        const response = await http.get(API_URL, {
            params: { limit, cursor }
        });
        return response.data;
    },

    // Lấy danh sách tin nhắn trong một cuộc hội thoại
    getMessages: async (conversationId: string, limit = 20, cursor?: string): Promise<PaginatedData<MessageResponse>> => {
        const response = await http.get(`${API_URL}/${conversationId}/messages`, {
            params: { limit, cursor }
        });
        return response.data;
    },

    // Gửi tin nhắn mới
    sendMessage: async (
        conversationId: string,
        content: string,
        type: string = "Text",
        clientMessageId: string
    ): Promise<MessageResponse> => {
        const payload = { content, type, clientMessageId };
        const response = await http.post(`${API_URL}/${conversationId}/messages`, payload);
        return response.data;
    },

    // Thêm thành viên vào nhóm
    addMemberToGroup: async (conversationId: string, userIdsToAdd: string[]): Promise<any> => {
        const response = await http.post(`${API_URL}/${conversationId}/members`, { userIdsToAdd });
        return response.data;
    },

    // Xóa/Rời nhóm
    removeMember: async (conversationId: string, userIdToRemove: string): Promise<any> => {
        const response = await http.delete(`${API_URL}/${conversationId}/members/${userIdToRemove}`);
        return response.data;
    },

    // Đánh dấu đã đọc toàn bộ tin nhắn trong hội thoại
    markAsRead: async (conversationId: string): Promise<any> => {
        const response = await http.put(`${API_URL}/${conversationId}/read`, {});
        return response.data;
    },

    // Lấy chi tiết một cuộc hội thoại
    getConversationById: async (conversationId: string): Promise<ConversationResponse> => {
        const response = await http.get(`${API_URL}/${conversationId}`);
        return response.data;
    },
};