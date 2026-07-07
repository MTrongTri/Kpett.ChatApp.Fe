import {
    CreateGroupRequest,
    CreateGroupResponse,
    GroupDetailResponse,
    MyGroupsRequest,
    MyGroupsResponse,
    UpdateGroupRequest,
    UpdateGroupResponse,
    UpdateGroupSettingsRequest,
    GroupSettingsResponse,
    UpdateGroupRulesRequest,
    DeleteGroupRequest,
    SearchGroupRequest,
    SearchGroupResponse,
} from "@/types/group";
import { GroupMemberListResponse } from "@/types/group-member";
import http from "@/lib/axios";

const API_URL = "/groups";

export const createGroup = async (data: CreateGroupRequest): Promise<CreateGroupResponse> => {
    const response = await http.post(`${API_URL}`, data);
    return response.data;
};

export const updateGroup = async (groupId: string, data: UpdateGroupRequest): Promise<UpdateGroupResponse> => {
    const response = await http.put(`${API_URL}/${groupId}`, data);
    return response.data;
};

export const getGroupSettings = async (groupId: string): Promise<GroupSettingsResponse> => {
    const response = await http.get(`${API_URL}/${groupId}/settings`);
    return response.data;
};

export const updateGroupSettings = async (groupId: string, data: UpdateGroupSettingsRequest): Promise<GroupSettingsResponse> => {
    const response = await http.put(`${API_URL}/${groupId}/settings`, data);
    return response.data;
};

export const updateGroupRules = async (groupId: string, data: UpdateGroupRulesRequest): Promise<GroupSettingsResponse> => {
    const response = await http.put(`${API_URL}/${groupId}/rules`, data);
    return response.data;
};

export const deleteGroup = async (groupId: string, data?: DeleteGroupRequest): Promise<void> => {
    await http.delete(`${API_URL}/${groupId}`, { data });
};

export const getGroupDetailById = async (groupId: string): Promise<GroupDetailResponse> => {
    const response = await http.get(`${API_URL}/${groupId}`);
    return response.data;
};

export const getGroupDetailBySlug = async (slug: string): Promise<GroupDetailResponse> => {
    const response = await http.get(`${API_URL}/slug/${slug}`);
    return response.data;
};

export const searchGroups = async (params?: SearchGroupRequest): Promise<SearchGroupResponse> => {
    const response = await http.get(`${API_URL}/search`, { params });
    return response.data;
};

export const getMyGroups = async (params?: MyGroupsRequest): Promise<MyGroupsResponse> => {
    const response = await http.get(`${API_URL}/me`, { params });
    return response.data;
};

import { JoinGroupResponse, LeaveGroupResponse } from "@/types/group-member";

export const joinGroup = async (groupId: string): Promise<JoinGroupResponse> => {
    const response = await http.post(`${API_URL}/${groupId}/join`);
    return response.data;
};

export const leaveGroup = async (groupId: string): Promise<LeaveGroupResponse> => {
    const response = await http.post(`${API_URL}/${groupId}/leave`);
    return response.data;
};

import { PaginatedData } from "@/types/common/api";
import { CreatePostRequest, Post } from "@/types/post";

export const createGroupPost = async (groupId: string, data: CreatePostRequest) => {
    const response = await http.post(`${API_URL}/${groupId}/posts`, data);
    return response.data;
};

export const getGroupPosts = async (groupId: string, cursor?: string | null, limit: number = 10, status?: string): Promise<PaginatedData<Post>> => {
    const params: Record<string, unknown> = { cursor, limit };
    if (status) params.status = status;
    const response = await http.get(`${API_URL}/${groupId}/posts`, { params });
    return response.data;
};

export const moderateGroupPost = async (groupId: string, postId: string, status: "approved" | "rejected") => {
    const response = await http.put(`${API_URL}/${groupId}/posts/${postId}/status`, { status });
    return response.data;
};

// ── THÀNH VIÊN ──

export const getGroupMembers = async (groupId: string, params?: { keyword?: string; role?: string; page?: number; pageSize?: number }): Promise<GroupMemberListResponse> => {
    const response = await http.get(`${API_URL}/${groupId}/members`, { params });
    return response.data;
};

export const getGroupPendingJoinRequests = async (groupId: string, params?: { page?: number; pageSize?: number }): Promise<GroupMemberListResponse> => {
    const response = await http.get(`${API_URL}/${groupId}/join-requests`, { params });
    return response.data;
};

export const acceptJoinRequest = async (groupId: string, targetUserId: string) => {
    const response = await http.post(`${API_URL}/${groupId}/join-requests/${targetUserId}/accept`);
    return response.data;
};

export const declineJoinRequest = async (groupId: string, targetUserId: string) => {
    const response = await http.post(`${API_URL}/${groupId}/join-requests/${targetUserId}/decline`);
    return response.data;
};

export const kickMember = async (groupId: string, targetUserId: string) => {
    const response = await http.delete(`${API_URL}/${groupId}/members/${targetUserId}`);
    return response.data;
};

export const updateMemberRole = async (groupId: string, targetUserId: string, role: string) => {
    const response = await http.put(`${API_URL}/${groupId}/members/${targetUserId}/role`, { role });
    return response.data;
};

export const revokeMemberRole = async (groupId: string, targetUserId: string) => {
    const response = await http.delete(`${API_URL}/${groupId}/members/${targetUserId}/role`);
    return response.data;
};

export const getBlockedMembers = async (groupId: string, params?: { page?: number; pageSize?: number }): Promise<GroupMemberListResponse> => {
    const response = await http.get(`${API_URL}/${groupId}/blocked-members`, { params });
    return response.data;
};

export const unblockMember = async (groupId: string, targetUserId: string) => {
    const response = await http.post(`${API_URL}/${groupId}/members/${targetUserId}/unblock`);
    return response.data;
};

export const getAdminsAndModerators = async (groupId: string, params?: { page?: number; pageSize?: number }): Promise<GroupMemberListResponse> => {
    const response = await http.get(`${API_URL}/${groupId}/admins-moderators`, { params });
    return response.data;
};

export const transferOwnership = async (groupId: string, targetUserId: string) => {
    const response = await http.post(`${API_URL}/${groupId}/transfer-ownership`, { targetUserId });
    return response.data;
};

export const togglePinPost = async (groupId: string, postId: string) => {
    const response = await http.post(`${API_URL}/${groupId}/posts/${postId}/pin`);
    return response.data;
};

export const inviteMembers = async (groupId: string, userIds: string[]) => {
    const response = await http.post(`${API_URL}/${groupId}/invitations`, { userIds });
    return response.data;
};

// ── LỜI MỜI ──

export interface GroupInvitationResponse {
    id: string;
    groupId: string;
    invitedByUserId: string;
    inviteeUserId: string;
    status: string;
    createdAt: string;
}

export const getMyInvitations = async (): Promise<GroupInvitationResponse[]> => {
    const response = await http.get(`${API_URL}/invitations`);
    return response.data;
};

export const acceptInvitation = async (invitationId: string) => {
    const response = await http.post(`${API_URL}/invitations/${invitationId}/accept`);
    return response.data;
};

export const declineInvitation = async (invitationId: string) => {
    const response = await http.post(`${API_URL}/invitations/${invitationId}/decline`);
    return response.data;
};
