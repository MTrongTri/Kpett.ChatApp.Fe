export interface SystemMessageMetadata {
  actor?: { id: string; name: string };
  targets?: Array<{ id: string; name: string }>;
}

export interface MessageAttachmentResponse {
  id: string;
  url: string;
  type: string;
}

export interface MessageSnippetResponse {
  id: string;
  senderId: string;
  senderName: string;
  type: string;
  content: string;
  createdAt: string;
  actionMetadata?: SystemMessageMetadata;
}

export interface ParticipantResponse {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  role: string;
  isOnline?: boolean;
  lastReadMessageId?: string;
}

export interface ConversationResponse {
  id: string;
  type: "Direct" | "Group";
  name?: string;
  avatarUrl?: string;
  createdAt: string;
  lastMessageAt: string;
  lastMessage?: MessageSnippetResponse;
  participants: ParticipantResponse[];
  hasUnread: boolean;
}

export interface MessageResponse {
  id: string;
  conversationId?: string;
  clientMessageId?: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  type: string;
  content: string;
  createdAt: string;
  actionMetadata?: SystemMessageMetadata;
  replyToMessageId?: string;
  attachments?: MessageAttachmentResponse[];
  localStatus?: "sending" | "sent" | "error";
}