import http from "@/lib/axios";
import { ApiResponse, PaginatedData } from "@/types/common/api";
import { FriendRequestResponse } from "@/types/friend";
import { UserProfile } from "@/types/user";

export const friendRequest = (receiverId: string): Promise<ApiResponse<FriendRequestResponse>> => {
    return http.post("/relationships/friend-requests", {
        receiverId
    });

}

export const friendRequestCancel = (requestId: string): Promise<ApiResponse> => {
    return http.post(`/relationships/friend-requests/${requestId}/cancel`, {
        requestId
    });
}

export const friendRequestDecline = (requestId: string): Promise<ApiResponse> => {
    return http.post(`/relationships/friend-requests/${requestId}/decline`, {
        requestId
    });
}

export const friendRequestAccept = (requestId: string): Promise<ApiResponse> => {
    return http.post(`/relationships/friend-requests/${requestId}/accept`, {
        requestId
    });
}

export const unFriend = (targetUserId: string): Promise<ApiResponse> => {
    return http.delete(`/relationships/${targetUserId}`);
}

export const getFriendsWithFilter = (
    { search, cursor, limit }: { search: string, cursor: string | null, limit: number }):
    Promise<ApiResponse<PaginatedData<UserProfile>>> => {
    return http.get(`/relationships/friends`, {
        params: {
            search,
            cursor,
            limit
        }
    });
}