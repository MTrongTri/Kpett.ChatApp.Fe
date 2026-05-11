import type {
  TabConfig,
  LinkPlatform,
  PrivacyOption,
  NotifySetting,
  NotifyChannel,
  EditProfileState,
} from "@/types/edit-profile";
import { Bell, Camera, Globe, Link, Lock, Phone, Shield, User, X } from "lucide-react";
import { SiGithub, SiLinkerd, SiX, SiYoutube } from '@icons-pack/react-simple-icons';
// ── TABS ──────────────────────────────────────────────────────────────
export const EDIT_TABS: TabConfig[] = [
  { key: "general", label: "Thông tin", icon: User },
  { key: "account", label: "Tài khoản", icon: Lock },
  { key: "links", label: "Liên kết", icon: Link },
  { key: "privacy", label: "Quyền riêng tư", icon: Shield },
  { key: "notify", label: "Thông báo", icon: Bell },
];

// ── GRADIENT PALETTES ─────────────────────────────────────────────────
export const COVER_GRADIENTS: string[] = [
  "from-emerald-950 via-teal-900 to-cyan-950",
  "from-indigo-950 via-blue-900 to-violet-900",
  "from-rose-950 via-red-900 to-orange-900",
  "from-sky-950 via-blue-900 to-cyan-900",
  "from-zinc-950 via-neutral-900 to-stone-900",
  "from-violet-950 via-purple-900 to-fuchsia-900",
  "from-green-950 via-emerald-900 to-teal-900",
  "from-orange-950 via-amber-900 to-yellow-900",
];

export const AVATAR_GRADIENTS: string[] = [
  "from-emerald-400 to-teal-500",
  "from-indigo-500 to-purple-600",
  "from-pink-500 to-rose-500",
  "from-sky-400 to-cyan-400",
  "from-orange-400 to-yellow-400",
  "from-violet-500 to-purple-500",
  "from-red-400 to-orange-400",
  "from-lime-400 to-emerald-400",
];

// ── SOCIAL LINKS ──────────────────────────────────────────────────────
export const LINK_PLATFORMS: LinkPlatform[] = [
  { key: "github", icon: SiGithub, label: "GitHub", placeholder: "github.com/username" },
  { key: "twitter", icon: SiX, label: "Twitter/X", placeholder: "x.com/username" },
  { key: "website", icon: Globe, label: "Website", placeholder: "yoursite.com" },
  { key: "youtube", icon: SiYoutube, label: "YouTube", placeholder: "youtube.com/@channel" },
];

// ── PRIVACY ───────────────────────────────────────────────────────────
export const PRIVACY_OPTIONS: PrivacyOption[] = [
  {
    key: "public",
    label: "Công khai",
    desc: "Tất cả mọi người đều có thể xem trang cá nhân của bạn",
  },
  {
    key: "private",
    label: "Riêng tư",
    desc: "Chỉ người theo dõi được chấp thuận mới thấy bài viết",
  },
];

export const PRIVACY_TOGGLES: NotifySetting[] = [
  { key: "showActivity", label: "Hiện trạng thái hoạt động", desc: "Người khác có thể thấy bạn đang online" },
  { key: "allowMention", label: "Cho phép nhắc tên", desc: "Ai cũng có thể tag bạn trong bài viết" },
  { key: "showLikes", label: "Hiển thị lượt thích", desc: "Số lượt thích công khai trên tất cả bài viết" },
  { key: "allowShare", label: "Cho phép chia sẻ bài viết", desc: "Người khác có thể chia sẻ bài của bạn" },
];

// ── NOTIFICATIONS ─────────────────────────────────────────────────────
export const NOTIFY_CHANNELS: NotifyChannel[] = [
  { key: "push", label: "Thông báo đẩy", icon: Phone },
  // { key: "email", label: "Qua email",          icon: Camera },
];

export const NOTIFY_SETTINGS: NotifySetting[] = [
  { key: "likes", label: "Lượt thích", desc: "Khi ai đó thích bài viết của bạn" },
  { key: "comments", label: "Bình luận", desc: "Khi ai đó bình luận vào bài viết" },
  { key: "follows", label: "Theo dõi mới", desc: "Khi có người mới theo dõi bạn" },
  { key: "mentions", label: "Nhắc đến", desc: "Khi ai đó tag bạn trong bài viết" },
  { key: "messages", label: "Tin nhắn", desc: "Khi nhận được tin nhắn mới" },
];

// ── DEFAULT STATE ─────────────────────────────────────────────────────
export const DEFAULT_EDIT_STATE: EditProfileState = {
  general: {
    displayName: "Hùng Nguyễn",
    username: "hung.travel",
    role: "Travel Photographer · Content Creator",
    bio: "📷 Nhiếp ảnh du lịch & đường phố\nKhám phá vẻ đẹp Việt Nam qua từng khung hình.\nSài Gòn 🌆 → Đà Lạt 🌿 → khắp nơi trên đất nước này.",
    location: "TP. Hồ Chí Minh, Việt Nam",
    website: "hungtravel.vn",
    birthday: "1998-07-15",
    avatarGradient: "from-emerald-400 to-teal-500",
    avatarInitial: "H",
    coverGradient: "from-emerald-950 via-teal-900 to-cyan-950",
  },
  account: {
    email: "hung@hungtravel.vn",
    phone: "+84 912 345 678",
    currentPass: "",
    newPass: "",
    confirmPass: "",
  },
  links: {
    github: "github.com/hung-travel",
    twitter: "x.com/hungtravel_vn",
    website: "hungtravel.vn",
    youtube: "",
    linkedin: "",
  },
  privacy: {
    account: "public",
    showActivity: true,
    allowMention: true,
    showLikes: true,
    allowShare: true,
  },
  notify: {
    push_likes: true,
    push_comments: true,
    push_follows: true,
    push_mentions: false,
    push_messages: true,
    email_likes: false,
    email_comments: false,
    email_follows: true,
    email_mentions: false,
    email_messages: true,
  },
};