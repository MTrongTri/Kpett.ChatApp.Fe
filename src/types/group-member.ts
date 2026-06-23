// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GROUP MEMBER TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type GroupMemberRole = "member" | "moderator" | "admin";

export type GroupMemberStatus = "active" | "pending" | "declined" | "left" | "kicked" | "blocked";

export interface JoinGroupResponse {
    groupId: string;
    userId: string;
    status: GroupMemberStatus;
    role: GroupMemberRole;
    requiresApproval: boolean;
    joinedAt: string | null;
}

export interface LeaveGroupResponse {
    // API chưa mô tả chi tiết response của leave, 
    // tạm thời define type rỗng hoặc chứa data cơ bản nếu có
    success?: boolean;
}
