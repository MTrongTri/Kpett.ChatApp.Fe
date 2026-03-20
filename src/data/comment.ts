import { Comment } from "@/types/comment";
import { MOCK_USER_PROFILES } from "./user";

const users = {
  tuan: MOCK_USER_PROFILES[0], // user_1
  hoa: MOCK_USER_PROFILES[1], // user_2
  kien: MOCK_USER_PROFILES[2], // user_3
  coffee: MOCK_USER_PROFILES[3], // user_4
  thanh: MOCK_USER_PROFILES[4], // user_5
};

const defaultViewer = {
  isLiked: false,
  canEdit: false,
  canDelete: false,
  canReply: true,
};

export const MOCK_COMMENT: Comment[] = [
  // ==========================================
  // THREAD 1: BÀI VIẾT KPETT CỦA TUẤN DEV (p_u1_5)
  // ==========================================
  {
    id: "c_1",
    postId: "p_u1_5",
    parentId: null,
    author: users.hoa,
    content:
      "Chúc mừng <@user_1> nha! Trưa nay ghé <@user_4> làm ly latte không? ☕",
    mentions: [
      { userId: "user_1", username: "dev.tuan", displayName: "Tuấn Dev" },
      {
        userId: "user_4",
        username: "langthang.coffee",
        displayName: "Cà Phê Lang Thang",
      },
    ],
    metrics: { likeCount: 15, replyCount: 2 },
    viewerContext: { ...defaultViewer, isLiked: true },
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T10:15:00.000Z",
    updatedAt: "2026-03-18T10:15:00.000Z",
  },
  {
    id: "c_2",
    postId: "p_u1_5",
    parentId: "c_1",
    author: users.tuan,
    content: "Cảm ơn <@user_2>! Rủ thêm <@user_3> đi cùng luôn haha 👨‍👩‍👧‍👦.",
    mentions: [
      { userId: "user_2", username: "hoa.boutique", displayName: "Hoa Lê" },
      { userId: "user_3", username: "kien.fitness", displayName: "Kiên Trần" },
    ],
    metrics: { likeCount: 8, replyCount: 0 },
    viewerContext: { ...defaultViewer, canEdit: true, canDelete: true },
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T10:20:00.000Z",
    updatedAt: "2026-03-18T10:20:00.000Z",
  },
  {
    id: "c_3",
    postId: "p_u1_5",
    parentId: "c_1",
    author: users.thanh,
    content: "<@user_1> <@user_2> Cho ké với nha, dạo này thèm cafe quá!",
    mentions: [
      { userId: "user_1", username: "dev.tuan", displayName: "Tuấn Dev" },
      { userId: "user_2", username: "hoa.boutique", displayName: "Hoa Lê" },
    ],
    metrics: { likeCount: 5, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T10:25:00.000Z",
    updatedAt: "2026-03-18T10:25:00.000Z",
  },
  {
    id: "c_4",
    postId: "p_u1_5",
    parentId: null,
    author: users.thanh,
    content:
      "Bác <@user_1> cho hỏi SignalR dùng tốn RAM server lắm không? Mình đang định tích hợp vào web ảnh.",
    mentions: [
      { userId: "user_1", username: "dev.tuan", displayName: "Tuấn Dev" },
    ],
    metrics: { likeCount: 2, replyCount: 1 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T10:30:00.000Z",
    updatedAt: "2026-03-18T10:30:00.000Z",
  },
  {
    id: "c_5",
    postId: "p_u1_5",
    parentId: "c_4",
    author: users.tuan,
    content:
      "Cũng khá tốn nếu connection nhiều đó <@user_5>. Nhớ config Redis backplane để scale ra nhiều server nha.",
    mentions: [
      { userId: "user_5", username: "thanh.photo", displayName: "Thành Đạt" },
    ],
    metrics: { likeCount: 4, replyCount: 0 },
    viewerContext: { ...defaultViewer, canEdit: true, canDelete: true },
    isEdited: true,
    isDeleted: false,
    createdAt: "2026-03-18T10:35:00.000Z",
    updatedAt: "2026-03-18T10:40:00.000Z",
  },
  {
    id: "c_6",
    postId: "p_u1_5",
    parentId: null,
    author: users.kien,
    content:
      "Đỉnh chóp anh zai! Code xong ra phòng gym làm vài set giải mỏi lưng nha.",
    mentions: [],
    metrics: { likeCount: 12, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T11:00:00.000Z",
    updatedAt: "2026-03-18T11:00:00.000Z",
  },

  // ==========================================
  // THREAD 2: BÀI VIẾT ẢNH CỦA THÀNH ĐẠT (p_u5_5)
  // ==========================================
  {
    id: "c_7",
    postId: "p_u5_5",
    parentId: null,
    author: users.hoa,
    content:
      "Trời ơi màu ảnh vintage ưng quá. <@user_5> set thông số ntn chia sẻ em với?",
    mentions: [
      { userId: "user_5", username: "thanh.photo", displayName: "Thành Đạt" },
    ],
    metrics: { likeCount: 25, replyCount: 1 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T12:00:00.000Z",
    updatedAt: "2026-03-18T12:00:00.000Z",
  },
  {
    id: "c_8",
    postId: "p_u5_5",
    parentId: "c_7",
    author: users.thanh,
    content:
      "Dạ em chụp gốc rồi kéo màu xíu trên Lightroom chị <@user_2> ạ. Để tí em gửi preset qua inbox cho chị nha.",
    mentions: [
      { userId: "user_2", username: "hoa.boutique", displayName: "Hoa Lê" },
    ],
    metrics: { likeCount: 8, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T12:10:00.000Z",
    updatedAt: "2026-03-18T12:10:00.000Z",
  },
  {
    id: "c_99",
    postId: "p_u5_5",
    parentId: "c_7",
    author: users.thanh,
    content: "ok em!",
    mentions: [
      { userId: "user_2", username: "hoa.boutique", displayName: "Hoa Lê" },
    ],
    metrics: { likeCount: 8, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T12:10:00.000Z",
    updatedAt: "2026-03-18T12:10:00.000Z",
  },
  {
    id: "c_9",
    postId: "p_u5_5",
    parentId: null,
    author: users.tuan,
    content:
      "Nhìn ảnh phát muốn xách balo lên đi du lịch luôn. Code củng dạo này stress quá 🥲",
    mentions: [],
    metrics: { likeCount: 18, replyCount: 1 },
    viewerContext: { ...defaultViewer, canEdit: true, canDelete: true },
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T13:00:00.000Z",
    updatedAt: "2026-03-18T13:00:00.000Z",
  },
  {
    id: "c_10",
    postId: "p_u5_5",
    parentId: "c_9",
    author: users.thanh,
    content:
      "<@user_1> Đóng máy lại đi Đà Lạt 1 chuyến đi sếp ơi, để tui làm guide cho.",
    mentions: [
      { userId: "user_1", username: "dev.tuan", displayName: "Tuấn Dev" },
    ],
    metrics: { likeCount: 5, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-18T13:15:00.000Z",
    updatedAt: "2026-03-18T13:15:00.000Z",
  },

  // ==========================================
  // THREAD 3: BÀI TẬP DEADLIFT CỦA KIÊN TRẦN (p_u3_2)
  // ==========================================
  {
    id: "c_11",
    postId: "p_u3_2",
    parentId: null,
    author: users.tuan,
    content:
      "Mới nhìn ông kéo tạ thôi mà lưng tôi đã nhói lên rồi <@user_3> =)) Dân văn phòng ngồi nhiều cột sống yếu quá.",
    mentions: [
      { userId: "user_3", username: "kien.fitness", displayName: "Kiên Trần" },
    ],
    metrics: { likeCount: 45, replyCount: 1 },
    viewerContext: { ...defaultViewer, canEdit: true, canDelete: true },
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-14T17:30:00.000Z",
    updatedAt: "2026-03-14T17:30:00.000Z",
  },
  {
    id: "c_12",
    postId: "p_u3_2",
    parentId: "c_11",
    author: users.kien,
    content:
      "<@user_1> Chịu khó qua phòng tôi nắn lại xương khớp cho. Chứ ngồi code cả ngày cẩn thận thoát vị đĩa đệm đó bro.",
    mentions: [
      { userId: "user_1", username: "dev.tuan", displayName: "Tuấn Dev" },
    ],
    metrics: { likeCount: 12, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-14T17:45:00.000Z",
    updatedAt: "2026-03-14T17:45:00.000Z",
  },
  {
    id: "c_13",
    postId: "p_u3_2",
    parentId: null,
    author: users.coffee,
    content:
      "Trước khi tập bài này thì táng 1 ly espresso của <@user_4> là nâng tạ mượt ngay phải không HLV <@user_3>?",
    mentions: [
      {
        userId: "user_4",
        username: "langthang.coffee",
        displayName: "Cà Phê Lang Thang",
      },
      { userId: "user_3", username: "kien.fitness", displayName: "Kiên Trần" },
    ],
    metrics: { likeCount: 30, replyCount: 1 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-14T18:00:00.000Z",
    updatedAt: "2026-03-14T18:00:00.000Z",
  },
  {
    id: "c_14",
    postId: "p_u3_2",
    parentId: "c_13",
    author: users.kien,
    content: "Chuẩn luôn shop ơi! Tranh thủ seeding ác quá nha 😂",
    mentions: [],
    metrics: { likeCount: 15, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-14T18:10:00.000Z",
    updatedAt: "2026-03-14T18:10:00.000Z",
  },
  {
    id: "c_15",
    postId: "p_u3_2",
    parentId: null,
    author: users.hoa,
    content: "Bài này nữ tập được không ạ? Em sợ to đùi 🥲",
    mentions: [],
    metrics: { likeCount: 5, replyCount: 2 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-14T19:00:00.000Z",
    updatedAt: "2026-03-14T19:00:00.000Z",
  },
  {
    id: "c_16",
    postId: "p_u3_2",
    parentId: "c_15",
    author: users.kien,
    content:
      "Được chứ <@user_2>! Biến thể RDL (Romanian Deadlift) ăn vào mông đùi sau cực tốt cho nữ. Không lo to đùi trước đâu.",
    mentions: [
      { userId: "user_2", username: "hoa.boutique", displayName: "Hoa Lê" },
    ],
    metrics: { likeCount: 10, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-14T19:15:00.000Z",
    updatedAt: "2026-03-14T19:15:00.000Z",
  },
  {
    id: "c_17",
    postId: "p_u3_2",
    parentId: "c_15",
    author: users.thanh,
    content: "<@user_2> Tập đi chị, để mốt chụp lookbook đồ bó sát cho cháy 🔥",
    mentions: [
      { userId: "user_2", username: "hoa.boutique", displayName: "Hoa Lê" },
    ],
    metrics: { likeCount: 7, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-14T19:20:00.000Z",
    updatedAt: "2026-03-14T19:20:00.000Z",
  },

  // ==========================================
  // THREAD NGẪU NHIÊN: CÁC COMMENT TEST UI
  // ==========================================
  {
    id: "c_18",
    postId: "p_u2_2",
    parentId: null,
    author: users.tuan,
    content:
      "Tone Beige này mặc lên nhìn dịu mắt thật. <@user_2> cho mình hỏi bên shop có nhận làm đồng phục cho công ty phần mềm không? Mình đang muốn đặt khoảng 50 áo phông trơn chất liệu thoáng mát một chút. Gửi mẫu qua email cho mình tham khảo nhé. Cảm ơn shop!",
    mentions: [
      { userId: "user_2", username: "hoa.boutique", displayName: "Hoa Lê" },
    ],
    metrics: { likeCount: 0, replyCount: 0 },
    viewerContext: { ...defaultViewer, canEdit: true, canDelete: true },
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-05T16:00:00.000Z",
    updatedAt: "2026-03-05T16:00:00.000Z",
  },
  {
    id: "c_19",
    postId: "p_u4_1",
    parentId: null,
    author: users.thanh,
    content:
      "Nhóm mình gồm <@user_1>, <@user_3> và <@user_2> cuối tuần này định ghé quán. Nhớ chừa cho tụi mình bàn view cửa sổ nhé <@user_4>!",
    mentions: [
      { userId: "user_1", username: "dev.tuan", displayName: "Tuấn Dev" },
      { userId: "user_3", username: "kien.fitness", displayName: "Kiên Trần" },
      { userId: "user_2", username: "hoa.boutique", displayName: "Hoa Lê" },
      {
        userId: "user_4",
        username: "langthang.coffee",
        displayName: "Cà Phê Lang Thang",
      },
    ],
    metrics: { likeCount: 11, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: true,
    isDeleted: false,
    createdAt: "2026-03-10T08:00:00.000Z",
    updatedAt: "2026-03-10T08:05:00.000Z",
  },
  {
    id: "c_20",
    postId: "p_u4_1",
    parentId: null,
    author: users.coffee,
    content: "Dạ vâng ạ!",
    mentions: [],
    metrics: { likeCount: 2, replyCount: 0 },
    viewerContext: defaultViewer,
    isEdited: false,
    isDeleted: false,
    createdAt: "2026-03-10T08:15:00.000Z",
    updatedAt: "2026-03-10T08:15:00.000Z",
  },
];
