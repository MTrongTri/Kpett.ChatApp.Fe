import { MOCK_COMMENT } from "@/data/comment";
import { Comment } from "@/types/comment";
import { ApiResponse, PaginatedData } from "@/types/common/api";
import http from "./http";

export const addComment = async (
  postId: string,
  content: string,
  parentCommentId: string | null = null,
): Promise<ApiResponse<Comment>> => {
  return http.post(`/posts/${postId}/comments`, {
    content,
    parentCommentId
  })
};

export const getCommentsByPostId = async (
  postId: string,
  parentCommentId: string | null,
  cursor: string | null = null,
  limit: number = 10,
): Promise<ApiResponse<PaginatedData<Comment>>> => {
  return http.get(`/posts/${postId}/comments`, {
    params: {
      parentCommentId,
      cursor,
      limit
    }
  })
};

export const getRepliesByCommentId = async (
  parentId: string,
  cursor: string | null = null,
  limit: number = 3,
): Promise<ApiResponse<PaginatedData<Comment>>> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`Fetching replies for comment: ${parentId}, cursor: ${cursor}`);

    let allFiltered = MOCK_COMMENT.filter(
      (comment) => comment.parentId === parentId,
    ).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    // 2. Tìm vị trí của cursor để phân trang
    let startIndex = 0;
    if (cursor) {
      const idx = allFiltered.findIndex((c) => c.id === cursor);
      if (idx !== -1) {
        // Bắt đầu lấy từ phần tử NGAY SAU cursor
        startIndex = idx + 1;
      }
    }

    // 3. Slice mảng dữ liệu dựa trên limit
    const items = allFiltered.slice(startIndex, startIndex + limit);

    // 4. Tính toán metadata
    const hasMore = startIndex + limit < allFiltered.length;
    // Gán ID của reply cuối cùng trong mảng làm cursor cho lần gọi tiếp theo
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      isSuccess: true,
      message: "Tải câu trả lời thành công",
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
      message: "Lỗi hệ thống khi tải câu trả lời",
      statusCode: 500,
      errorCode: "SERVER_ERROR",
    };
  }
};
