export interface BaseUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export type BaseAuthor = BaseUser;

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
  totalPosts: number;
  friends: number;
  followers: number;
  following: number;
}

export interface UserGeneralInfo extends BaseUser {
  biography: string | null;
  occupation: string | null;
  location: string | null;
  dateOfBirth: string | null;
}

export interface ProfileViewerContext {
  isOwner: boolean;
  isFriend: boolean;
  isFollowing: boolean;
  relationshipRequestId: string | null;
  hasSentFriendRequest: boolean;
  hasReceivedFriendRequest: boolean;
  isBlocked: boolean;
  canMessage: boolean;
}

export interface UserProfile extends UserGeneralInfo {
  coverUrl: string | null;
  isVerified: boolean;
  isOnline: boolean;
  lastActiveAt?: string;
  socialMedia: SocialProfile;
  stats: UserStats;

  viewerContext: ProfileViewerContext;
}

export interface UserWithStats extends BaseUser {
  stats: UserStats;
}

// Response
export interface CheckUsernameResponse {
  isAvailable: boolean;
}

export interface UserLoginResponse extends BaseUser {
  isProfileCompleted: boolean;
}

