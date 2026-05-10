// services/friend.service.ts
import http from "@/lib/axios";
import { PaginatedData } from "@/types/common/api";
import { FriendRequestResponse } from "@/types/friend";
import { UserProfile } from "@/types/user";

export const friendRequest = async (receiverId: string): Promise<FriendRequestResponse> => {
    const response = await http.post("/relationships/friend-requests", {
        receiverId
    });
    return response.data;
};

export const friendRequestCancel = async (requestId: string): Promise<any> => {
    const response = await http.post(`/relationships/friend-requests/${requestId}/cancel`, {
        requestId
    });
    return response.data;
};

export const friendRequestDecline = async (requestId: string): Promise<any> => {
    const response = await http.post(`/relationships/friend-requests/${requestId}/decline`, {
        requestId
    });
    return response.data;
};

export const friendRequestAccept = async (requestId: string): Promise<any> => {
    const response = await http.post(`/relationships/friend-requests/${requestId}/accept`, {
        requestId
    });
    return response.data;
};

export const unFriend = async (targetUserId: string): Promise<any> => {
    const response = await http.delete(`/relationships/${targetUserId}`);
    return response.data;
};

export const getFriendsWithFilter = async (
    { search, cursor, limit }: { search: string, cursor: string | null, limit: number }
): Promise<PaginatedData<UserProfile>> => {
    const response = await http.get(`/relationships/friends`, {
        params: {
            search,
            cursor,
            limit
        }
    });
    return response.data;
};

export const getFriendSuggestions = async (limit: number = 10): Promise<UserProfile[]> => {
    const response = await http.get(`/relationships/friends/suggestions`, {
        params: { limit }
    });
    return response.data;
};