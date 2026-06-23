
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
    name: string;                          // [BẮT BUỘC]
    description?: string;
    type?: string;                         // "public" | "private" | "hidden"  (mặc định: "public")
    avatarUrl?: string;
    coverImageUrl?: string;
    language?: string;                     // mặc định: "vi"
    rules?: string[];                      // Danh sách nội quy (mảng chuỗi)
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
    privacy?: number;                      // 0=Public | 1=Private | 2=Hidden
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
    type: string;                          // "public" | "private" | "hidden"
    createdAt: string;
    createdByUserId: string | null;
    updatedAt: string | null;
    isMember: boolean;
    myRole: string | null;                 // "admin" | "moderator" | "member" | null
    memberCount: number;
}


// ── 3. CẬP NHẬT QUY TẮC NHÓM — PUT /api/groups/{groupId}/rules ──

export interface UpdateGroupRulesRequest {
    rules: GroupRule[];
}

export interface GroupSettingsResponse {
    groupId: string;
    privacy: string;                       // "public" | "private" | "hidden"
    whoCanPost: string;                    // "anyone" | "admin_mod" | "admin_only"
    whoCanInvite: string;                  // "anyone" | "admin_mod" | "admin_only"
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
    description: string | null;
    type: string;                          // "public" | "private" | "hidden"
    createdAt: string;
    createdByUserId: string | null;
    updatedAt: string | null;
    isMember: boolean;
    myRole: string | null;                 // "admin" | "moderator" | "member" | null
    memberCount: number;
}


// ── TÌM KIẾM NHÓM — GET /api/groups/search ──

export interface SearchGroupRequest {
    keyword?: string;
    type?: string;                         // "public" | "private" | "hidden"
    language?: string;
    sortBy?: number;                       // 0=Relevance | 1=NewestCreated | 2=MostMembers | 3=MostActive
    page?: number;
    pageSize?: number;
}

export interface SearchGroupItem {
    id: string;
    name: string | null;
    slug: string;
    avatarUrl: string | null;
    privacy: number;                       // 0=Public | 1=Private | 2=Hidden
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
    myRole: number;                        // 0=Member | 1=Moderator | 2=Admin
    memberCount: number;
    unreadPostCount: number;
    joinedAt: string;
}

export interface MyGroupsResponse {
    items: MyGroupItem[];
    totalCount: number;
}
