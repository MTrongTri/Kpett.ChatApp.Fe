import type { UserProfile, GridPost, GridComment } from "@/types/profile";

export const MOCK_PROFILE: UserProfile = {
  username:        "hung.travel",
  displayName:     "Hùng Nguyễn",
  role:            "Travel Photographer · Content Creator",
  bio:             "📷 Nhiếp ảnh du lịch & đường phố\nKhám phá vẻ đẹp Việt Nam qua từng khung hình.\nSài Gòn 🌆 → Đà Lạt 🌿 → khắp nơi trên đất nước này.",
  location:        "TP. Hồ Chí Minh, Việt Nam",
  joinedAt:        "Tháng 3, 2022",
  website:         "hungtravel.vn",
  avatarInitial:   "H",
  avatarGradient:  "from-emerald-400 to-teal-500",
  coverGradient:   "from-emerald-950 via-teal-900 to-cyan-950",
  isVerified:      true,
  isOnline:        true,
  isFollowing:     false,
  isFollowingBack: true,
  stats: {
    posts:     384,
    followers: 28400,
    following: 512,
    likes:     142000,
  },
  socialLinks: [
    { icon: "🐙", label: "hung-travel",     url: "#" },
    { icon: "🐦", label: "@hungtravel_vn",  url: "#" },
    { icon: "🌐", label: "hungtravel.vn",   url: "#" },
    { icon: "▶️", label: "Hùng Travel",     url: "#" },
  ],
  highlights: [
    { id: "h1", title: "Đà Lạt",  emoji: "🌿", bgGradient: "from-emerald-500 to-teal-600"   },
    { id: "h2", title: "Sài Gòn", emoji: "🌆", bgGradient: "from-amber-500 to-yellow-500"   },
    { id: "h3", title: "Hà Nội",  emoji: "🏛️", bgGradient: "from-rose-500 to-pink-600"      },
    { id: "h4", title: "Hội An",  emoji: "🏮", bgGradient: "from-orange-500 to-red-500"     },
    { id: "h5", title: "Food",    emoji: "🍜", bgGradient: "from-red-600 to-orange-500"     },
    { id: "h6", title: "Behind",  emoji: "📷", bgGradient: "from-violet-600 to-purple-500"  },
    { id: "h7", title: "Moto",    emoji: "🏍️", bgGradient: "from-amber-800 to-yellow-600"  },
  ],
};

export const MOCK_GRID_POSTS: GridPost[] = [
  { id: "g1",  emoji: "🌇", bgGradient: "from-rose-950 via-red-900 to-orange-800",     likeCount: 1248, commentCount: 84,  category: "city",   isPinned: true  },
  { id: "g2",  emoji: "🌿", bgGradient: "from-emerald-950 via-teal-900 to-cyan-900",   likeCount: 3512, commentCount: 142, category: "nature"                  },
  { id: "g3",  emoji: "☀️", bgGradient: "from-amber-950 via-orange-900 to-yellow-800", likeCount: 891,  commentCount: 56,  category: "food",   isVideo: true   },
  { id: "g4",  emoji: "🎨", bgGradient: "from-indigo-950 via-blue-900 to-violet-800",  likeCount: 2104, commentCount: 198, category: "art"                     },
  { id: "g5",  emoji: "🏍️",bgGradient: "from-orange-950 via-amber-900 to-yellow-800", likeCount: 674,  commentCount: 43,  category: "travel"                  },
  { id: "g6",  emoji: "🍜", bgGradient: "from-red-950 via-rose-900 to-pink-800",       likeCount: 1832, commentCount: 97,  category: "food"                    },
  { id: "g7",  emoji: "🏛️",bgGradient: "from-violet-950 via-purple-900 to-fuchsia-800",likeCount: 2341, commentCount: 167, category: "city",   isVideo: true  },
  { id: "g8",  emoji: "🌊", bgGradient: "from-cyan-950 via-sky-900 to-blue-900",       likeCount: 988,  commentCount: 72,  category: "nature"                  },
  { id: "g9",  emoji: "🌸", bgGradient: "from-pink-950 via-rose-900 to-red-900",       likeCount: 1456, commentCount: 89,  category: "nature"                  },
  { id: "g10", emoji: "🏮", bgGradient: "from-yellow-950 via-orange-900 to-red-800",   likeCount: 3021, commentCount: 214, category: "city"                    },
  { id: "g11", emoji: "📷", bgGradient: "from-zinc-900 via-neutral-800 to-stone-900",  likeCount: 567,  commentCount: 38,  category: "art"                     },
  { id: "g12", emoji: "🌄", bgGradient: "from-indigo-950 via-violet-900 to-purple-800",likeCount: 4102, commentCount: 289, category: "nature", isVideo: true   },
];

export const MOCK_COMMENTS: GridComment[] = [
  { username: "minh.photo",  avatarInitial: "M", avatarGradient: "from-pink-500 to-rose-500",    text: "Đẹp quá bro! 😍",                    time: "2 giờ"   },
  { username: "linh_art",    avatarInitial: "L", avatarGradient: "from-sky-400 to-cyan-400",     text: "Màu sắc tuyệt vời 🎨",               time: "1 giờ"   },
  { username: "anh_thu99",   avatarInitial: "A", avatarGradient: "from-rose-400 to-pink-400",    text: "Mình cũng muốn đến đây 🌿",          time: "45 phút" },
  { username: "nam.design",  avatarInitial: "N", avatarGradient: "from-violet-500 to-purple-500",text: "Bức ảnh này xứng đáng lên trang chủ 🔥", time: "30 phút" },
];