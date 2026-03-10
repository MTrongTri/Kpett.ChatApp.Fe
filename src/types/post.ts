import { LucideIcon } from "lucide-react";

export type PostCategory =
  | "city"
  | "nature"
  | "food"
  | "art"
  | "design"
  | "tech"
  | "travel";

export interface PostAuthor {
  id: string;
  username: string;
  displayName: string;
  /** Tailwind gradient string, e.g. "from-indigo-500 to-purple-600" */
  avatarGradient: string;
  avatarInitial: string;
  isVerified?: boolean;
  isOnline?: boolean;
}

export interface PollOption {
  id: string;
  emoji?: string;
  label: string;
  percentage: number;
  /** Tailwind color for the bar, e.g. "bg-primary" */
  barColor?: string;
}

export interface Poll {
  options: PollOption[];
  totalVotes: number;
  daysLeft: number;
}

export interface Post {
  id: string;
  author: PostAuthor;
  title: string;
  body: string;
  tags: string[];
  category: PostCategory;
  /** Emoji used as placeholder image */
  imageEmoji?: string;
  /** Tailwind gradient for the image bg, e.g. "from-violet-900 to-pink-500" */
  imageBg?: string;
  imageAspect?: "square" | "wide";
  likeCount: number;
  commentCount: number;
  repostCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
  poll?: Poll;
}

export interface SpotlightUser {
  id: string;
  username: string;
  avatarInitial: string;
  avatarGradient: string;
  bgEmoji: string;
  bgGradient: string;
  seen?: boolean;
}

export interface SuggestedUser {
  id: string;
  username: string;
  reason: string;
  avatarInitial: string;
  avatarGradient: string;
}

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  html: string;
  time: string;
  iconColor: string;
}

export interface TrendingTag {
  rank: number;
  name: string;
  count: string;
  percentage: number;
}

export interface OnlineFriend {
  id: string;
  username: string;
  status: string;
  isOnline: boolean;
  avatarInitial: string;
  avatarGradient: string;
}