import { Media, MediaType } from "./media";
import { BaseAuthor } from "./user";

export type PrivacyLevel = "public" | "friends" | "private";

export interface PostAuthor extends BaseAuthor {}

export interface PostMetrics {
  likeCount: number;
  commentCount: number;
}

interface PostViewerContext {
  isOwner: boolean;
  isLiked: boolean;
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
  hashtags: string[];
  media: Media[];

  metrics: PostMetrics;
  viewerContext: PostViewerContext;
  privacy: PrivacyLevel;

  createdAt: string;
  updatedAt?: string;
}

export interface PostThumbnail {
  id: string;
  author: PostAuthor;
  thumbnailUrl: string;
  type: MediaType;

  metrics: PostMetrics;
  viewerContext: PostViewerContext;

  createdAt: string;
  updatedAt?: string;
}
