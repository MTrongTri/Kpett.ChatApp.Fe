
// request 
export interface CreateGroupRequest {
    name?: string;
    description?: string;
    type: string;    // — "public" | "private" | "hidden"  (mặc định: "public")
    avatarUrl?: string;
    coverImageUrl?: string;
    language: string;
    rules: string;
}


// response
export interface CreateGroupResponse {
    id: string;
    name: string;
    slug: string;
    createdAt: string;

}


export interface UpdateGroupRequest {
    name?: string;
    description?: string;
    privacy?: string;    // 0=Public | 1=Private | 2=Hidden
    avatarUrl?: string;
    coverImageUrl?: string;
    language?: string;
    rules?: string;
}

export interface UpdateGroupResponse {
    id: string;
    name: string;
    avatarUrl: string;
    description: string;
    type: string;               // "public" | "private" | "hidden"
    createdAt: string;
    createdByUserId: string;
    updatedAt: string;
    isMember: boolean;
    myRole: string;             // "admin" | "moderator" | "member" | null
    memberCount: number;
}


export interface DeleteGroupRequest {
    reason: string;
}


// XEM CHI TIẾT NHÓM (theo ID) — GET /api/groups/{groupId} 
// XEM CHI TIẾT NHÓM (theo Slug) — GET /api/groups/slug/{slug}
export interface GroupDetailResponse {

    id: string;
    name: string;
    slug: string;
    avatarUrl: string;
    description: string;
    type: string;               // "public" | "private" | "hidden"
    createdAt: string;
    createdByUserId: string;
    updatedAt: string;
    isMember: boolean;
    myRole: string;             // "admin" | "moderator" | "member" | null
    memberCount: number;

}


// DANH SÁCH NHÓM CỦA TÔI — GET /api/groups/me
export type GroupRoleFilter = "admin" | "moderator" | "member";
export interface MyGroupsRequest {
    filterByRole?: GroupRoleFilter;
    page?: number;
    pageSize?: number;
}

export interface MyGroupsResponse {

    id: string;
    name: string;
    slug: string;
    avatarUrl: string;
    description: string;
    type: string;               // "public" | "private" | "hidden"
    createdAt: string;
    createdByUserId: string;
    updatedAt: string;
    isMember: boolean;
    myRole: string;             // "admin" | "moderator" | "member" | null
    memberCount: number;

}


