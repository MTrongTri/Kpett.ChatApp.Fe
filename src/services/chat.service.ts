import http from '@/lib/axios';
import {
    ConversationResponse,
    MessageResponse,
    ParticipantResponse,
} from '@/types/chat';
import { PaginatedData } from '@/types/common/api';

const API_URL = '/conversations';

export const chatService = {
    hasUnreadConversations: async (): Promise<boolean> => {
        const response = await http.get(`${API_URL}/has-unread`);
        return response.data;
    },

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

    // Lấy hoặc tạo đoạn chat 1-1 với một user
    getOrCreateDirectConversation: async (userId: string): Promise<ConversationResponse> => {
        const response = await http.get(`${API_URL}/direct/${userId}`);
        return response.data;
    },

    // Tạo nhóm mới
    createGroupConversation: async (name: string, participantIds: string[]): Promise<ConversationResponse> => {
        const payload = { type: 'Group', name, participantIds };
        const response = await http.post(`${API_URL}`, payload);
        return response.data;
    },

    // Lấy danh sách bạn bè chưa có trong nhóm
    getFriendsNotInGroup: async (conversationId: string, search: string = "", limit = 20, cursor?: string): Promise<PaginatedData<any>> => {
        const response = await http.get(`${API_URL}/${conversationId}/friends-not-in-group`, {
            params: { search, limit, cursor }
        });
        return response.data;
    },

    getGroupMembers: async (
        conversationId: string,
        limit: number = 20,
        cursor?: string
    ): Promise<PaginatedData<ParticipantResponse>> => {
        const response = await http.get(`${API_URL}/${conversationId}/members`, {
            params: { limit, cursor }
        });
        return response.data;
    },
};