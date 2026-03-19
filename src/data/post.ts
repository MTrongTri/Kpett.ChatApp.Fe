import { Post, PostThumbnail } from "@/types/post";
import { MOCK_USER_PROFILES } from "./user";

const defaultViewer = {
  isOwner: false,
  isLiked: false,
  isSaved: false,
  isPinned: false,
  canEdit: false,
  canDelete: false,
  canLike: true,
  canComment: true,
  canPin: false,
};

export const MOCK_POSTS: Post[] = [
  // --- USER 1: Tuấn Dev (Kpett.ChatApp & Tech) ---
  {
    id: "p_u1_1",
    author: MOCK_USER_PROFILES[0],
    title: "Khởi tạo dự án mới!",
    content:
      "Chính thức bắt tay vào Kpett.ChatApp. Sẽ dùng Next.js cho frontend để SSR mượt mà.",
    hashtags: ["nextjs", "frontend", "coding"],
    media: [
      {
        id: "m_u1_1",
        type: "image",
        url: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1200",
      },
    ],
    metrics: { likeCount: 150, commentCount: 20 },
    viewerContext: {
      ...defaultViewer,
      isOwner: true,
      canEdit: true,
      canDelete: true,
    },
    privacy: "public",
    createdAt: "2026-03-10T08:00:00.000Z",
  },
  {
    id: "p_u1_2",
    author: MOCK_USER_PROFILES[0],
    title: "Thiết kế Clean Architecture",
    content:
      "Chia layer cho backend ASP.NET Core tốn thời gian phết nhưng về sau scale dự án sẽ rất nhàn.",
    hashtags: ["dotnet", "cleanarchitecture", "backend"],
    media: [],
    metrics: { likeCount: 85, commentCount: 15 },
    viewerContext: {
      ...defaultViewer,
      isOwner: true,
      canEdit: true,
      canDelete: true,
    },
    privacy: "public",
    createdAt: "2026-03-12T14:30:00.000Z",
  },
  {
    id: "p_u1_3",
    author: MOCK_USER_PROFILES[0],
    title: "Cấu hình Logging",
    content:
      "Đã tích hợp xong hệ thống logging để tracking lỗi toàn cục. Ngủ ngon hơn hẳn.",
    hashtags: ["logging", "aspnetcore", "devlife"],
    media: [
      {
        id: "m_u1_3",
        type: "image",
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200",
      },
    ],
    metrics: { likeCount: 210, commentCount: 30 },
    viewerContext: {
      ...defaultViewer,
      isOwner: true,
      canEdit: true,
      canDelete: true,
    },
    privacy: "public",
    createdAt: "2026-03-15T09:15:00.000Z",
  },
  {
    id: "p_u1_4",
    author: MOCK_USER_PROFILES[0],
    title: "Góc làm việc cuối tuần",
    content: "Chạy deadline nhè nhẹ. Cà phê và code.",
    hashtags: ["workspace", "weekend", "coding"],
    media: [
      {
        id: "m_u1_4",
        type: "image",
        url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200",
      },
    ],
    metrics: { likeCount: 340, commentCount: 45 },
    viewerContext: {
      ...defaultViewer,
      isOwner: true,
      canEdit: true,
      canDelete: true,
    },
    privacy: "public",
    createdAt: "2026-03-16T20:00:00.000Z",
  },
  {
    id: "p_u1_5",
    author: MOCK_USER_PROFILES[0],
    title: "Hoàn thành test tính năng Chat",
    content:
      "Luồng dữ liệu realtime chạy rất ổn định. Chuẩn bị push code lên branch main.",
    hashtags: ["milestone", "kpett", "realtime"],
    media: [
      {
        id: "m_u1_5",
        type: "image",
        url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
      },
    ],
    metrics: { likeCount: 500, commentCount: 88 },
    viewerContext: {
      ...defaultViewer,
      isOwner: true,
      isPinned: true,
      canEdit: true,
      canDelete: true,
      canPin: true,
    },
    privacy: "public",
    createdAt: "2026-03-18T10:00:00.000Z",
  },

  // --- USER 2: Hoa Lê (Fashion) ---
  {
    id: "p_u2_1",
    author: MOCK_USER_PROFILES[1],
    title: "Chất liệu Linen",
    content: "Mùa hè không thể thiếu những item từ linen.",
    hashtags: ["linen", "summer", "fashion"],
    media: [
      {
        id: "m_u2_1",
        type: "image",
        url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
      },
    ],
    metrics: { likeCount: 1200, commentCount: 45 },
    viewerContext: { ...defaultViewer, isLiked: true },
    privacy: "public",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "p_u2_2",
    author: MOCK_USER_PROFILES[1],
    title: "Mix & Match tone Beige",
    content: "Tone màu an toàn nhưng không bao giờ nhàm chán.",
    hashtags: ["beige", "ootd", "style"],
    media: [
      {
        id: "m_u2_2",
        type: "image",
        url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
      },
    ],
    metrics: { likeCount: 2300, commentCount: 110 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-05T15:00:00.000Z",
  },
  {
    id: "p_u2_3",
    author: MOCK_USER_PROFILES[1],
    title: "Behind the scenes",
    content: "Quá trình chuẩn bị cho bộ sưu tập mới tại xưởng.",
    hashtags: ["behindthescenes", "design", "localbrand"],
    media: [
      {
        id: "m_u2_3",
        type: "image",
        url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200",
      },
    ],
    metrics: { likeCount: 980, commentCount: 30 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-10T09:00:00.000Z",
  },
  {
    id: "p_u2_4",
    author: MOCK_USER_PROFILES[1],
    title: "Phụ kiện tối giản",
    content: "Điểm nhấn hoàn hảo cho trang phục trơn.",
    hashtags: ["accessories", "minimalist"],
    media: [
      {
        id: "m_u2_4",
        type: "image",
        url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
      },
    ],
    metrics: { likeCount: 1500, commentCount: 65 },
    viewerContext: { ...defaultViewer, isSaved: true },
    privacy: "public",
    createdAt: "2026-03-15T11:00:00.000Z",
  },
  {
    id: "p_u2_5",
    author: MOCK_USER_PROFILES[1],
    title: "Lookbook SS26 Released!",
    content: "Bộ sưu tập Spring/Summer 2026 đã chính thức lên kệ.",
    hashtags: ["lookbook", "newarrival", "ss26"],
    media: [
      {
        id: "m_u2_5a",
        type: "image",
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
      },
      {
        id: "m_u2_5b",
        type: "image",
        url: "https://images.unsplash.com/photo-1773332585754-f1436987743b?w=1200&",
      },
    ],
    metrics: { likeCount: 5600, commentCount: 420 },
    viewerContext: { ...defaultViewer, isLiked: true },
    privacy: "public",
    createdAt: "2026-03-18T08:00:00.000Z",
  },

  // --- USER 3: Kiên Trần (Fitness) ---
  {
    id: "p_u3_1",
    author: MOCK_USER_PROFILES[2],
    title: "Chế độ dinh dưỡng",
    content: "Ăn đủ đạm là chìa khóa để xây dựng cơ bắp.",
    hashtags: ["nutrition", "diet", "protein"],
    media: [
      {
        id: "m_u3_1",
        type: "image",
        url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200",
      },
    ],
    metrics: { likeCount: 890, commentCount: 45 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-12T06:00:00.000Z",
  },
  {
    id: "p_u3_2",
    author: MOCK_USER_PROFILES[2],
    title: "Form Deadlift chuẩn",
    content: "Đừng để chấn thương lưng dưới vì sai form. Tập chậm lại.",
    hashtags: ["deadlift", "workout", "gymtips"],
    media: [
      {
        id: "m_u3_2",
        type: "image",
        url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200",
      },
    ],
    metrics: { likeCount: 2100, commentCount: 150 },
    viewerContext: { ...defaultViewer, isSaved: true },
    privacy: "public",
    createdAt: "2026-03-14T17:00:00.000Z",
  },
  {
    id: "p_u3_3",
    author: MOCK_USER_PROFILES[2],
    title: "Cardio ngày nghỉ",
    content: "Phục hồi tích cực bằng 30 phút đạp xe nhẹ nhàng.",
    hashtags: ["cardio", "recovery", "fitness"],
    media: [
      {
        id: "m_u3_3",
        type: "image",
        url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200",
      },
    ],
    metrics: { likeCount: 1200, commentCount: 30 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-15T08:00:00.000Z",
  },
  {
    id: "p_u3_4",
    author: MOCK_USER_PROFILES[2],
    title: "Kiên trì là tất cả",
    content: "Động lực giúp bạn bắt đầu, thói quen giúp bạn tiếp tục.",
    hashtags: ["motivation", "mindset", "gymlife"],
    media: [],
    metrics: { likeCount: 3400, commentCount: 88 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-16T21:00:00.000Z",
  },
  {
    id: "p_u3_5",
    author: MOCK_USER_PROFILES[2],
    title: "Update học viên tháng 3",
    content: "Thành quả sau 3 tháng siết mỡ của bạn Đức. Rất tuyệt vời!",
    hashtags: ["transformation", "coaching", "proud"],
    media: [
      {
        id: "m_u3_5",
        type: "image",
        url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1200",
      },
    ],
    metrics: { likeCount: 4500, commentCount: 210 },
    viewerContext: { ...defaultViewer, isLiked: true },
    privacy: "public",
    createdAt: "2026-03-18T12:00:00.000Z",
  },

  // --- USER 4: Cà Phê Lang Thang ---
  {
    id: "p_u4_1",
    author: MOCK_USER_PROFILES[3],
    title: "Hạt Kenya AA",
    content: "Chua thanh, hậu vị ngọt kéo dài. Hợp nhất pha Pour Over.",
    hashtags: ["specialtycoffee", "kenya", "pourover"],
    media: [
      {
        id: "m_u4_1",
        type: "image",
        url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1200",
      },
    ],
    metrics: { likeCount: 600, commentCount: 25 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-10T07:30:00.000Z",
  },
  {
    id: "p_u4_2",
    author: MOCK_USER_PROFILES[3],
    title: "Góc sân nhỏ",
    content: "Chỗ ngồi lý tưởng cho buổi sáng mùa thu.",
    hashtags: ["coffeeshop", "vibes", "phanthiet"],
    media: [
      {
        id: "m_u4_2",
        type: "image",
        url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200",
      },
    ],
    metrics: { likeCount: 1100, commentCount: 50 },
    viewerContext: { ...defaultViewer, isLiked: true },
    privacy: "public",
    createdAt: "2026-03-12T16:00:00.000Z",
  },
  {
    id: "p_u4_3",
    author: MOCK_USER_PROFILES[3],
    title: "Nghệ thuật Latte",
    content:
      "Barista của quán đang tập luyện mỗi ngày để mang đến những ly cà phê đẹp nhất.",
    hashtags: ["latteart", "barista", "espresso"],
    media: [
      {
        id: "m_u4_3",
        type: "image",
        url: "https://images.unsplash.com/photo-1495474472204-518605ec2187?w=1200",
      },
    ],
    metrics: { likeCount: 850, commentCount: 40 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-15T09:00:00.000Z",
  },
  {
    id: "p_u4_4",
    author: MOCK_USER_PROFILES[3],
    title: "Bánh sừng trâu mới ra lò",
    content: "Kết hợp hoàn hảo cùng một ly Capuccino nóng.",
    hashtags: ["croissant", "pastry", "breakfast"],
    media: [
      {
        id: "m_u4_4",
        type: "image",
        url: "https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=1200",
      },
    ],
    metrics: { likeCount: 1300, commentCount: 85 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-17T07:00:00.000Z",
  },
  {
    id: "p_u4_5",
    author: MOCK_USER_PROFILES[3],
    title: "Thông báo nghỉ lễ",
    content: "Quán sẽ đóng cửa bảo trì máy pha vào ngày mai nhé mọi người.",
    hashtags: ["notice", "closed"],
    media: [],
    metrics: { likeCount: 300, commentCount: 15 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-18T14:00:00.000Z",
  },

  // --- USER 5: Thành Đạt (Photography) ---
  {
    id: "p_u5_1",
    author: MOCK_USER_PROFILES[4],
    title: "Bình minh Tà Xùa",
    content: "Săn mây thành công ở độ cao 2000m.",
    hashtags: ["taxua", "cloudhunting", "vietnam"],
    media: [
      {
        id: "m_u5_1",
        type: "image",
        url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200",
      },
    ],
    metrics: { likeCount: 8900, commentCount: 320 },
    viewerContext: { ...defaultViewer, isSaved: true },
    privacy: "public",
    createdAt: "2026-03-05T06:00:00.000Z",
  },
  {
    id: "p_u5_2",
    author: MOCK_USER_PROFILES[4],
    title: "Review Lens 16-35mm GM",
    content:
      "Góc rộng tuyệt vời cho phong cảnh. Độ sắc nét hoàn hảo từ tâm ra rìa.",
    hashtags: ["sonyalpha", "gearreview", "lens"],
    media: [
      {
        id: "m_u5_2",
        type: "image",
        url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200",
      },
    ],
    metrics: { likeCount: 4200, commentCount: 180 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-08T19:00:00.000Z",
  },
  {
    id: "p_u5_3",
    author: MOCK_USER_PROFILES[4],
    title: "Phố cổ Hội An ban đêm",
    content: "Những dải đèn lồng rực rỡ bên dòng sông Hoài.",
    hashtags: ["hoian", "nightphotography", "lanterns"],
    media: [
      {
        id: "m_u5_3",
        type: "image",
        url: "https://images.unsplash.com/photo-1559592413-7ceacaebce18?w=1200",
      },
    ],
    metrics: { likeCount: 12500, commentCount: 450 },
    viewerContext: { ...defaultViewer, isLiked: true },
    privacy: "public",
    createdAt: "2026-03-12T21:30:00.000Z",
  },
  {
    id: "p_u5_4",
    author: MOCK_USER_PROFILES[4],
    title: "Kỹ thuật phơi sáng dài",
    content: "Cách setup thông số để mặt nước mịn màng như sương.",
    hashtags: ["longexposure", "tutorial", "photography"],
    media: [
      {
        id: "m_u5_4",
        type: "image",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200",
      },
    ],
    metrics: { likeCount: 6700, commentCount: 290 },
    viewerContext: { ...defaultViewer, isSaved: true },
    privacy: "public",
    createdAt: "2026-03-16T18:00:00.000Z",
  },
  {
    id: "p_u5_5",
    author: MOCK_USER_PROFILES[4],
    title: "Chân dung đời thường",
    content: "Một khoảnh khắc rất tình cờ trên chuyến tàu lửa Bắc Nam.",
    hashtags: ["streetphotography", "portrait", "filmlook"],
    media: [
      {
        id: "m_u5_5",
        type: "image",
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200",
      },
    ],
    metrics: { likeCount: 15400, commentCount: 620 },
    viewerContext: defaultViewer,
    privacy: "public",
    createdAt: "2026-03-18T11:45:00.000Z",
  },
];

export const MOCK_POST_THUMBNAILS: PostThumbnail[] = MOCK_POSTS.filter(
  (p) => p.media.length > 0,
).map((p) => ({
  id: p.id,
  author: p.author,
  thumbnailUrl: p.media[0].url,
  type: p.media[0].type as any,
  metrics: p.metrics,
  viewerContext: p.viewerContext,
  createdAt: p.createdAt,
}));
