import { Media, MediaType } from "./media";
import { BaseAuthor } from "./user";

export type PrivacyLevel = "public" | "friends" | "private";

export type PostAuthor = BaseAuthor;

export interface PostMetrics {
  likeCount: number;
  commentCount: number;
}

interface PostViewerContext {
  isOwner: boolean;
  isLiked: boolean;
  reactionType: number | null;
  isSaved: boolean;
  isPinned: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canLike: boolean;
  canComment: boolean;
  canPin?: boolean;
}

export interface Post {
  id: string;
  author: PostAuthor;
  title?: string;
  content: string;
  type: string;
  hashtags: string[];
  media: Media[];

  metrics: PostMetrics;
  viewerContext: PostViewerContext;
  privacy: PrivacyLevel;

  groupId: string | null;
  status?: "approved" | "pending" | "rejected";
  isNsfw?: boolean;
  allowComments?: boolean;
  group?: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
    privacy: "public" | "private" | "hidden" | null;
  } | null;

  createdAt: string;
  updatedAt?: string;
}

export interface PostThumbnail {
  id: string;
  author: PostAuthor;
  mediaThumbnail: Media;
  type: MediaType;

  metrics: PostMetrics;
  viewerContext: PostViewerContext;

  createdAt: string;
  updatedAt?: string;
}

// Request
export interface CreatePostRequest {
  content?: string,
  privacy: string,
  media: Media[],
  isNsfw?: boolean,
  allowComments?: boolean,
}
