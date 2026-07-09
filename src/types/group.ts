
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GROUP TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Shared / Reusable ──

export interface GroupRule {
    id?: string;
    title: string;
    description?: string;
    order: number;
}

// ── 1. TẠO NHÓM — POST /api/groups ──

export interface CreateGroupRequest {
    name: string;
    description?: string;
    type?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    language?: string;
    rules?: string[];
    inviteeIds?: string[];
}

export interface CreateGroupResponse {
    id: string;
    name: string;
    slug: string | null;
    createdAt: string;
}


// ── 2. CẬP NHẬT NHÓM — PUT /api/groups/{groupId} ──

export interface UpdateGroupRequest {
    name?: string;
    description?: string;
    type?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    language?: string;
    rules?: string[];
}

export interface UpdateGroupResponse {
    id: string;
    name: string;
    avatarUrl: string | null;
    description: string | null;
    type: string;
    createdAt: string;
    createdByUserId: string | null;
    updatedAt: string | null;
    isMember: boolean;
    myRole: string | null;
    memberCount: number;
}


// ── 3. CẬP NHẬT QUY TẮC NHÓM — PUT /api/groups/{groupId}/rules ──

export interface UpdateGroupRulesRequest {
    rules: GroupRule[];
}

export interface GroupSettingsResponse {
    groupId: string;
    privacy: string;
    whoCanPost: string;
    whoCanInvite: string;
    postApproval: boolean;
    memberApproval: boolean;
    language: string;
    rules: GroupRule[];
    updatedAt: string;
}

export interface UpdateGroupSettingsRequest {
    privacy?: string;
    whoCanPost?: string;
    whoCanInvite?: string;
    postApproval?: boolean;
    memberApproval?: boolean;
    language?: string;
    rules?: GroupRule[];
}


// ── XÓA NHÓM — DELETE /api/groups/{groupId} ──

export interface DeleteGroupRequest {
    reason?: string;
}


// ── XEM CHI TIẾT NHÓM — GET /api/groups/{groupId} | GET /api/groups/slug/{slug} ──

export interface GroupDetailResponse {
    id: string;
    name: string;
    slug: string;
    avatarUrl: string | null;
    coverImageUrl: string | null;
    description: string | null;
    type: string;
    language: string;
    whoCanPost: string;
    whoCanInvite: string;
    postApproval: boolean;
    memberApproval: boolean;
    rules: GroupRule[];
    createdAt: string;
    createdByUserId: string | null;
    updatedAt: string | null;
    isMember: boolean;
    myRole: string | null;
    memberCount: number;
}


// ── TÌM KIẾM NHÓM — GET /api/groups/search ──

export interface SearchGroupRequest {
    keyword?: string;
    type?: string;
    language?: string;
    sortBy?: number;
    page?: number;
    pageSize?: number;
}

export interface SearchGroupItem {
    id: string;
    name: string | null;
    slug: string;
    avatarUrl: string | null;
    privacy: number;
    memberCount: number;
    isMember: boolean;
}

export interface SearchGroupResponse {
    items: SearchGroupItem[];
    totalCount: number;
    page: number;
    pageSize: number;
}


// ── DANH SÁCH NHÓM CỦA TÔI — GET /api/groups/me ──

export type GroupRoleFilter = "admin" | "moderator" | "member";

export interface MyGroupsRequest {
    filterByRole?: GroupRoleFilter;
    page?: number;
    pageSize?: number;
}

export interface MyGroupItem {
    id: string;
    name: string | null;
    slug: string;
    avatarUrl: string | null;
    myRole: number;
    memberCount: number;
    unreadPostCount: number;
    joinedAt: string;
}

export interface MyGroupsResponse {
    items: MyGroupItem[];
    totalCount: number;
}
