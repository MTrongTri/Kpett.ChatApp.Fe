import type {
  ChatUser,
  Conversation,
  SharedMediaItem,
  SidebarFilterOption,
} from "@/types/chat";

// ── CURRENT USER ──────────────────────────────────────────────────────
export const ME: ChatUser = {
  id:             "me",
  username:       "tuan.dev",
  displayName:    "Tuấn Dev",
  avatarInitial:  "T",
  avatarGradient: "from-indigo-500 to-purple-600",
  status:         "online",
};

// ── CONTACTS ──────────────────────────────────────────────────────────
const MINH: ChatUser = {
  id: "minh", username: "minh.photography", displayName: "Minh Photography",
  avatarInitial: "M", avatarGradient: "from-pink-500 to-rose-500",
  status: "online", location: "TP. Hồ Chí Minh", joinedAt: "3/2022", website: "minh.photography",
};
const HUNG: ChatUser = {
  id: "hung", username: "hung.travel", displayName: "Hung Travel",
  avatarInitial: "H", avatarGradient: "from-emerald-400 to-teal-500",
  status: "online", location: "Đà Lạt", joinedAt: "6/2021",
};
const LINH: ChatUser = {
  id: "linh", username: "linh_art", displayName: "Linh Art",
  avatarInitial: "L", avatarGradient: "from-sky-400 to-cyan-400",
  status: "away", location: "Hà Nội", joinedAt: "1/2023",
};
const NAM: ChatUser = {
  id: "nam", username: "nam.design", displayName: "Nam Design",
  avatarInitial: "N", avatarGradient: "from-violet-500 to-purple-500",
  status: "offline",
};
const ANH_THU: ChatUser = {
  id: "anhthu", username: "anh_thu99", displayName: "Anh Thu",
  avatarInitial: "A", avatarGradient: "from-rose-400 to-yellow-400",
  status: "online",
};
const KHANH: ChatUser = {
  id: "khanh", username: "khanh.moto", displayName: "Khanh Moto",
  avatarInitial: "K", avatarGradient: "from-orange-400 to-yellow-400",
  status: "away",
};

// ── CONVERSATIONS ─────────────────────────────────────────────────────
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1", partner: MINH, pinned: true, unread: 3,
    preview: "Ảnh hôm qua đẹp lắm bro 🔥", time: "14:32",
    messages: [
      { id:"m1", ownerId:"minh", text:"Ê bro, mày chụp ảnh hôm qua bằng máy gì vậy?",         time:"14:20", status:"read"      },
      { id:"m2", ownerId:"me",   text:"Sony A7IV, lens 85mm f/1.4. Ánh sáng hôm đó chuẩn 🙌", time:"14:21", status:"read"      },
      { id:"m3", ownerId:"minh", text:"Ảnh hôm qua đẹp lắm bro 🔥",                           time:"14:32", status:"read"      },
      { id:"m4", ownerId:"minh", text:"Mày có thể chia sẻ preset không?",                      time:"14:32", status:"read"      },
      { id:"m5", ownerId:"me",   text:"Để tao gửi cho sau nhé, đang edit xong bộ Đà Lạt",     time:"14:33", status:"delivered" },
    ],
  },
  {
    id: "c2", partner: HUNG, pinned: true, unread: 0,
    preview: "Đặt phòng rồi nha, check-in 8/3", time: "12:10",
    messages: [
      { id:"m1", ownerId:"hung", text:"Chuyến Đà Lạt tháng 3 mày đi không?",          time:"11:50", status:"read" },
      { id:"m2", ownerId:"me",   text:"Đi chứ! Booking chưa?",                        time:"11:51", status:"read" },
      { id:"m3", ownerId:"hung", text:"Đặt phòng rồi nha, check-in 8/3",              time:"12:10", status:"read" },
      { id:"m4", ownerId:"hung", text:"Phòng view sương sớm, chill lắm 🌿",           time:"12:10", status:"read" },
      { id:"m5", ownerId:"me",   text:"Perfect! Tao book vé bay luôn 🛫",             time:"12:15", status:"read" },
    ],
  },
  {
    id: "c3", partner: LINH, pinned: false, unread: 1,
    preview: "Mày thấy design mới của tao sao?", time: "Hôm qua",
    messages: [
      { id:"m1", ownerId:"linh", text:"Tao vừa update portfolio rồi nè",              time:"Hôm qua", status:"read" },
      { id:"m2", ownerId:"me",   text:"Wow clean lắm! Font chọn gì vậy?",            time:"Hôm qua", status:"read" },
      { id:"m3", ownerId:"linh", text:"Mày thấy design mới của tao sao?",            time:"Hôm qua", status:"read" },
    ],
  },
  {
    id: "c4", partner: NAM, pinned: false, unread: 0,
    preview: "Deadline dự án là cuối tuần này", time: "T2",
    messages: [
      { id:"m1", ownerId:"me",  text:"Mày xong phần UI chưa?",                       time:"T2", status:"read" },
      { id:"m2", ownerId:"nam", text:"Deadline dự án là cuối tuần này",              time:"T2", status:"read" },
      { id:"m3", ownerId:"nam", text:"Tao đang gấp lắm 😅",                          time:"T2", status:"read" },
    ],
  },
  {
    id: "c5", partner: ANH_THU, pinned: false, unread: 0,
    preview: "Haha oke nha, nhớ mang áo ấm!", time: "T3",
    messages: [
      { id:"m1", ownerId:"me",     text:"Chuyến Đà Lạt bao giờ đi?",                time:"T3", status:"read" },
      { id:"m2", ownerId:"anhthu", text:"Haha oke nha, nhớ mang áo ấm!",            time:"T3", status:"read" },
    ],
  },
  {
    id: "c6", partner: KHANH, pinned: false, unread: 2,
    preview: "Con R1 mới lên đồ đẹp vãi 😎", time: "T4",
    messages: [
      { id:"m1", ownerId:"khanh", text:"Con R1 mới lên đồ đẹp vãi 😎",              time:"T4", status:"read" },
      { id:"m2", ownerId:"khanh", text:"Cuối tuần đi Bình Dương không?",             time:"T4", status:"read" },
    ],
  },
];

// ── SHARED MEDIA (shown in info panel) ───────────────────────────────
export const MOCK_SHARED_MEDIA: SharedMediaItem[] = [
  { id:"s1", emoji:"🌇", bgGradient:"from-rose-950 via-red-900 to-orange-800"    },
  { id:"s2", emoji:"🌿", bgGradient:"from-emerald-950 via-teal-900 to-cyan-900"  },
  { id:"s3", emoji:"🎨", bgGradient:"from-indigo-950 via-blue-900 to-violet-800" },
  { id:"s4", emoji:"📷", bgGradient:"from-zinc-900 via-neutral-800 to-stone-900" },
  { id:"s5", emoji:"🌸", bgGradient:"from-pink-950 via-rose-900 to-red-900"      },
  { id:"s6", emoji:"🏛️",bgGradient:"from-violet-950 via-purple-900 to-fuchsia-800"},
];

// ── SIDEBAR FILTERS ───────────────────────────────────────────────────
export const SIDEBAR_FILTERS: SidebarFilterOption[] = [
  { key: "all",    label: "Tất cả"   },
  { key: "unread", label: "Chưa đọc" },
  { key: "pinned", label: "Đã ghim"  },
];

// ── REACT EMOJIS ──────────────────────────────────────────────────────
export const REACT_EMOJIS = ["❤️", "😂", "😮", "😢", "😡", "👍"];

// ── AUTO-REPLY POOL ───────────────────────────────────────────────────
export const AUTO_REPLIES = [
  "Oke bro! 👍",
  "Tao hiểu rồi 😄",
  "Hay đó!",
  "Cho tao xem với 🔥",
  "Tuyệt vời 🎉",
];
