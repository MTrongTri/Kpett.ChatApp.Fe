
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GROUP MEMBER TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type GroupMemberRole = "member" | "moderator" | "admin";

export type GroupMemberStatus = "active" | "pending" | "declined" | "left" | "kicked" | "blocked";

export interface GroupMemberResponse {
    memberId: string;
    groupId: string;
    userId: string;
    username: string | null;
    email: string | null;
    displayName: string | null;
    isVerified: boolean;
    role: string;
    status: string;
    createdAt: string;
    joinedAt: string | null;
    updatedAt: string | null;
}

export interface GroupMemberListResponse {
    items: GroupMemberResponse[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface JoinGroupResponse {
    groupId: string;
    userId: string;
    status: GroupMemberStatus;
    role: GroupMemberRole;
    requiresApproval: boolean;
    joinedAt: string | null;
}

export interface LeaveGroupResponse {
    success?: boolean;
}
