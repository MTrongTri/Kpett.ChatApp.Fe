export type PostCategory = "city" | "nature" | "food" | "art" | "design" | "tech" | "travel";
export type ProfileTab   = "posts" | "reels" | "saved" | "tagged";

export interface SocialLink {
  icon:  string;  // emoji icon
  label: string;
  url:   string;
}

export interface ProfileHighlight {
  id:         string;
  title:      string;
  emoji:      string;
  bgGradient: string; // Tailwind gradient classes
}

export interface ProfileStats {
  posts:     number;
  followers: number;
  following: number;
  likes:     number;
}

export interface UserProfile {
  username:        string;
  displayName:     string;
  role:            string;
  bio:             string;
  location:        string;
  joinedAt:        string;
  website?:        string;
  avatarInitial:   string;
  avatarGradient:  string; // Tailwind gradient classes
  coverGradient:   string; // Tailwind gradient classes
  isVerified:      boolean;
  isOnline:        boolean;
  isFollowing:     boolean;
  isFollowingBack: boolean;
  stats:           ProfileStats;
  socialLinks:     SocialLink[];
  highlights:      ProfileHighlight[];
}

export interface GridPost {
  id:           string;
  emoji:        string;
  bgGradient:   string; // Tailwind gradient classes
  likeCount:    number;
  commentCount: number;
  isVideo?:     boolean;
  isPinned?:    boolean;
  category:     PostCategory;
}

export interface GridComment {
  username:       string;
  avatarInitial:  string;
  avatarGradient: string; // Tailwind gradient classes
  text:           string;
  time:           string;
}