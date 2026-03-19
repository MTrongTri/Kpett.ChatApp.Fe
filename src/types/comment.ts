import { MediaType } from "./media";

export interface CommentAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export interface CommentMetrics {
  likeCount: number;
  replyCount: number;
}

export interface CommentViewerContext {
  isLiked: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReply: boolean;
}

export interface CommentAttachment {
  id: string;
  type: Exclude<MediaType, "audio">;
  url: string;
  thumbnailUrl?: string;
}

export interface MentionComment {
  userId: string;
  username: string;
  displayName: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;

  author: CommentAuthor;

  content: string;
  mentions?: MentionComment[];
  attachments?: CommentAttachment[];

  metrics: CommentMetrics;
  viewerContext: CommentViewerContext;

  isEdited: boolean;
  isDeleted: boolean;

  createdAt: string;
  updatedAt?: string;
}
