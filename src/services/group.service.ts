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
} 
from "@/types/group";
import http from "@/lib/axios";

const API_URL = "/groups";

// ── 1. TẠO NHÓM — POST /api/groups ──
export const createGroup = async (data: CreateGroupRequest): Promise<CreateGroupResponse> => {
    const response = await http.post(`${API_URL}`, data);
    return response.data;
};

// ── 2. CẬP NHẬT NHÓM — PUT /api/groups/{groupId} ──
export const updateGroup = async (groupId: string, data: UpdateGroupRequest): Promise<UpdateGroupResponse> => {
    const response = await http.put(`${API_URL}/${groupId}`, data);
    return response.data;
};

// ── CÀI ĐẶT NHÓM — GET /api/groups/{groupId}/settings ──
export const getGroupSettings = async (groupId: string): Promise<GroupSettingsResponse> => {
    const response = await http.get(`${API_URL}/${groupId}/settings`);
    return response.data;
};

// ── CẬP NHẬT CÀI ĐẶT NHÓM — PUT /api/groups/{groupId}/settings ──
export const updateGroupSettings = async (groupId: string, data: UpdateGroupSettingsRequest): Promise<GroupSettingsResponse> => {
    const response = await http.put(`${API_URL}/${groupId}/settings`, data);
    return response.data;
};

// ── CẬP NHẬT QUY TẮC NHÓM — PUT /api/groups/{groupId}/rules ──
export const updateGroupRules = async (groupId: string, data: UpdateGroupRulesRequest): Promise<GroupSettingsResponse> => {
    const response = await http.put(`${API_URL}/${groupId}/rules`, data);
    return response.data;
};

// ── XÓA NHÓM — DELETE /api/groups/{groupId} ──
export const deleteGroup = async (groupId: string, data?: DeleteGroupRequest): Promise<void> => {
    await http.delete(`${API_URL}/${groupId}`, { data });
};

// ── XEM CHI TIẾT NHÓM (theo ID) — GET /api/groups/{groupId} ──
export const getGroupDetailById = async (groupId: string): Promise<GroupDetailResponse> => {
    const response = await http.get(`${API_URL}/${groupId}`);
    return response.data;
};

// ── XEM CHI TIẾT NHÓM (theo Slug) — GET /api/groups/slug/{slug} ──
export const getGroupDetailBySlug = async (slug: string): Promise<GroupDetailResponse> => {
    const response = await http.get(`${API_URL}/slug/${slug}`);
    return response.data;
};

// ── TÌM KIẾM NHÓM — GET /api/groups/search ──
export const searchGroups = async (params?: SearchGroupRequest): Promise<SearchGroupResponse> => {
    const response = await http.get(`${API_URL}/search`, { params });
    return response.data;
};

// ── DANH SÁCH NHÓM CỦA TÔI — GET /api/groups/me ──
export const getMyGroups = async (params?: MyGroupsRequest): Promise<MyGroupsResponse> => {
    const response = await http.get(`${API_URL}/me`, { params });
    return response.data;
};

import { JoinGroupResponse, LeaveGroupResponse } from "@/types/group-member";

// ── THAM GIA NHÓM — POST /api/groups/{groupId}/join ──
export const joinGroup = async (groupId: string): Promise<JoinGroupResponse> => {
    const response = await http.post(`${API_URL}/${groupId}/join`);
    return response.data;
};

// ── RỜI NHÓM — POST /api/groups/{groupId}/leave ──
export const leaveGroup = async (groupId: string): Promise<LeaveGroupResponse> => {
    const response = await http.post(`${API_URL}/${groupId}/leave`);
    return response.data;
};
