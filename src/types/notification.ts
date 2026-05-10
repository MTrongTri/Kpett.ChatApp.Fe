export interface ActorSnippetResponse {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
}

export interface NotificationResponse {
    id: string;
    type: string;
    referenceId: string | null;
    metadata: any | null;
    isRead: boolean;
    createdAt: string;
    actor: ActorSnippetResponse | null;
}