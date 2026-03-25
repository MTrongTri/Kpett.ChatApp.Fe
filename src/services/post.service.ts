import { Post, PostThumbnail } from "@/types/post";
import http from "./http";
import { MOCK_POST_THUMBNAILS, MOCK_POSTS } from "@/data/post";
import { ProfileTab } from "@/app/(main)/[username]/components/profile-tabs";
import { ApiResponse, PaginatedData } from "@/types/common/api";

export const getFeedHome = async (
  cursor: string | null = null,
  limit: number = 5,
): Promise<ApiResponse<PaginatedData<Post>>> => {
  try {
    // 1. Giả lập delay mạng (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 2. Sắp xếp toàn bộ bài viết theo thời gian mới nhất (Không lọc theo username)
    const allPosts = [...MOCK_POSTS].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // 3. Xử lý logic Cursor
    let startIndex = 0;
    if (cursor) {
      const idx = allPosts.findIndex((p) => p.id === cursor);
      if (idx !== -1) {
        startIndex = idx + 1; // Lấy các bài viết SAU cursor
      } else {
        // Xử lý ngoại lệ: Nếu cursor không tồn tại (bài viết đã bị xóa)
        return {
          isSuccess: true,
          message: "Cursor không hợp lệ",
          statusCode: 200,
          data: {
            items: [],
            pagination: {
              nextCursor: null,
              hasMore: false,
              limit,
              totalCount: allPosts.length,
            },
          },
        };
      }
    }

    // 4. Cắt dữ liệu
    const items = allPosts.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < allPosts.length;

    // Đảm bảo có items mới lấy ID để tránh lỗi undefined
    const nextCursor =
      hasMore && items.length > 0 ? items[items.length - 1].id : null;

    return {
      isSuccess: true,
      message: "Tải bảng tin thành công",
      statusCode: 200,
      data: {
        items,
        pagination: {
          nextCursor,
          hasMore,
          limit,
          totalCount: allPosts.length,
        },
      },
    };
  } catch (error) {
    return {
      isSuccess: false,
      message: "Lỗi hệ thống khi tải bảng tin",
      statusCode: 500,
      errorCode: "SERVER_ERROR",
    };
  }
};

export const getPostsByUsername = async (
  username: string,
  tab: ProfileTab = "posts",
  cursor: string | null = null,
  limit: number = 6,
): Promise<ApiResponse<PaginatedData<PostThumbnail>>> => {
  try {
    // Giả lập delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Logic lọc dữ liệu (như đã làm ở bước trước)
    let allFiltered = MOCK_POST_THUMBNAILS.filter((post) => {
      if (tab === "posts") return post.author.username === username;
      if (tab === "reels")
        return post.author.username === username && post.type === "video";
      if (tab === "saved") return post.viewerContext.isSaved;
      return false;
    }).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    let startIndex = 0;
    if (cursor) {
      const idx = allFiltered.findIndex((p) => p.id === cursor);
      if (idx !== -1) startIndex = idx + 1;
    }

    const items = allFiltered.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < allFiltered.length;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      isSuccess: true,
      message: "Tải bài viết thành công",
      statusCode: 200,
      data: {
        items: items,
        pagination: {
          nextCursor,
          hasMore,
          limit,
          totalCount: allFiltered.length,
        },
      },
    };
  } catch (error) {
    return {
      isSuccess: false,
      message: "Lỗi hệ thống",
      statusCode: 500,
      errorCode: "SERVER_ERROR",
    };
  }
};

export const getPostById = async (
  postId: string,
): Promise<ApiResponse<Post>> => {
  try {
    // Giả lập delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const post = MOCK_POSTS.find((p) => p.id === postId);

    return {
      isSuccess: true,
      message: "Tải bài viết thành công",
      statusCode: 200,
      data: post,
    };
  } catch (error) {
    return {
      isSuccess: false,
      message: "Lỗi hệ thống",
      statusCode: 500,
      errorCode: "SERVER_ERROR",
    };
  }
};

export const createPost = (data: FormData) => http.post("/posts", data);
