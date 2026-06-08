export interface ActorSnippetResponse {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
}

export interface NotificationSound {
    enabled: boolean;
    key: string;
    volume: number;
}

export interface NotificationResponse {
    id: string;
    type: string;
    referenceId: string | null;
    metadata: unknown | null;
    isRead: boolean;
    createdAt: string;
    actor: ActorSnippetResponse | null;
    sound: NotificationSound | null;
}
