import {
    CreateGroupRequest,
    CreateGroupResponse,
    GroupDetailResponse,
    MyGroupsRequest,
    MyGroupsResponse,
    UpdateGroupRequest,
    UpdateGroupResponse,
    DeleteGroupRequest,
} 
from "@/types/group";
import http from "@/lib/axios";

const API_URL = "/groups";

export const createGroup = async (data: CreateGroupRequest): Promise<CreateGroupResponse> => {
    return http.post(`${API_URL}`, data);
};

export const getGroupDetailById = async (groupId: string): Promise<GroupDetailResponse> => {
    return http.get(`${API_URL}/${groupId}`);
};

export const getGroupDetailBySlug = async (slug: string): Promise<GroupDetailResponse> => {
    return http.get(`${API_URL}/slug/${slug}`);
};

export const updateGroup = async (groupId: string, data: UpdateGroupRequest): Promise<UpdateGroupResponse> => {
    return http.put(`${API_URL}/${groupId}`, data);
};

export const deleteGroup = async (groupId: string, data: DeleteGroupRequest): Promise<void> => {
    return http.delete(`${API_URL}/${groupId}`, { data });
};

export const getMyGroups = async (params?: MyGroupsRequest): Promise<MyGroupsResponse[]> => {
    return http.get(`${API_URL}/me`, {
        params,
    });
};

