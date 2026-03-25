// ── USER ─────────────────────────────────────────────────────────────
export type OnlineStatus = "online" | "away" | "offline";

export interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatarInitial: string;
  avatarGradient: string; // Tailwind gradient classes
  status: OnlineStatus;
  location?: string;
  joinedAt?: string;
  website?: string;
}

// ── MESSAGE ───────────────────────────────────────────────────────────
export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface ChatMessage {
  id: string;
  ownerId: string; // matches ChatUser.id; "me" for current user
  text: string;
  time: string; // display string e.g. "14:32"
  status: MessageStatus;
  reaction?: string; // emoji chosen by current user
}

// ── CONVERSATION ─────────────────────────────────────────────────────
export type FilterType = "all" | "unread" | "pinned";

export interface Conversation {
  id: string;
  partner: ChatUser;
  messages: ChatMessage[];
  pinned: boolean;
  unread: number;
  /** Shown as last-message preview in the sidebar */
  preview: string;
  time: string;
}

// ── SHARED MEDIA ─────────────────────────────────────────────────────
export interface SharedMediaItem {
  id: string;
  emoji: string;
  bgGradient: string; // Tailwind gradient classes
}

// ── SIDEBAR FILTER ────────────────────────────────────────────────────
export interface SidebarFilterOption {
  key: FilterType;
  label: string;
}
