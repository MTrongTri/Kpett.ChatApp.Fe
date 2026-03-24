export interface BaseUser {
  id: string;
  email?: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified?: boolean;
}

export interface BaseAuthor extends BaseUser {}

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

export interface SocialProfile {
  website?: string | null;
  github?: string | null;
  youtube?: string | null;
  x?: string | null;
}

export interface UserStats {
  posts: number;
  friends: number;
  followers: number;
  following: number;
}

export interface ProfileViewerContext {
  isOwner: boolean;
  isFriend: boolean;
  isFollowing: boolean;
  hasSentFriendRequest: boolean;
  hasReceivedFriendRequest: boolean;
  isBlocked: boolean;
  canMessage: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  biography: string;
  role: string;
  location: string;
  joinedAt: string;
  avatarUrl: string | null;
  coverUrl: string | null;

  isVerified: boolean;
  isOnline: boolean;
  lastActiveAt?: string;

  socialMedia: SocialProfile;
  stats: UserStats;

  viewerContext: ProfileViewerContext;
}
