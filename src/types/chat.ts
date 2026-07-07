import type { BaseUser } from "./user";

export interface SystemMessageMetadata {
  actionType: string;
  actor?: { id: string; name: string };
  targets?: Array<{ id: string; name: string }>;
  oldName?: string;
  newName?: string;
}

export interface MessageAttachmentResponse {
  id: string;
  messageId: string;
  type: string;
  url: string;
  publicId?: string;
  filename?: string;
  fileSize?: number;
  width?: number;
  height?: number;
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
  isFriend: boolean;
  lastReadMessageId?: string;
}

export type ConversationFriendCandidate = Pick<
  BaseUser,
  "id" | "username" | "displayName" | "avatarUrl"
>;

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

export interface TypingEventPayload {
  userId: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
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
