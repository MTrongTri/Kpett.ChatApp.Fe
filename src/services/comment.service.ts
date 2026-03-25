import { MOCK_COMMENT } from "@/data/comment";
import { ApiResponse, PaginatedData } from "@/types/common/api";
import { Comment, MentionComment } from "@/types/comment";
import { BaseAuthor, BaseUser } from "@/types/user";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const addComment = async (
  postId: string,
  content: string,
  author: BaseUser,
  parentId: string | null = null,
  mentions: MentionComment[] = [],
): Promise<ApiResponse<Comment>> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Tạo ID và Timestamp mới
    const newCommentId = `comment_new_${Date.now()}`;
    const now = new Date().toISOString();

    // Khởi tạo Object Comment mới
    const newComment: Comment = {
      id: newCommentId,
      postId: postId,
      parentId: parentId,
      content: content,
      author: author,
      mentions: mentions,
      isEdited: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      metrics: {
        likeCount: 0,
        replyCount: 0,
      },
      viewerContext: {
        isLiked: false,
        canReply: true,
        canDelete: true,
        canEdit: false,
      },
    };

    // THÊM VÀO DATABASE GIẢ (MOCK_COMMENT)
    MOCK_COMMENT.push(newComment);

    // CẬP NHẬT REPLY COUNT CHO COMMENT CHA (RẤT QUAN TRỌNG)
    if (parentId) {
      const parentComment = MOCK_COMMENT.find((c) => c.id === parentId);
      if (parentComment) {
        // Tăng số lượng reply lên 1 để UI hiện nút "Xem thêm câu trả lời"
        parentComment.metrics.replyCount += 1;
      }
    }

    // 6. Trả về kết quả thành công
    return {
      isSuccess: true,
      message: "Đã thêm bình luận thành công",
      statusCode: 201,
      data: newComment,
    };
  } catch (error) {
    return {
      isSuccess: false,
      message: "Lỗi hệ thống khi thêm bình luận",
      statusCode: 500,
      errorCode: "SERVER_ERROR",
    };
  }
};

export const getCommentsByPostId = async (
  postId: string,
  cursor: string | null = null,
  limit: number = 5,
): Promise<ApiResponse<PaginatedData<Comment>>> => {
  try {
    // Giả lập network delay (chờ 800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`Fetching comments for post: ${postId}, cursor: ${cursor}`);

    // 1. Lọc bình luận theo postId và chỉ lấy BÌNH LUẬN GỐC (parentId === null)
    let allFiltered = MOCK_COMMENT.filter(
      (comment) => comment.postId === postId && comment.parentId === null,
    ).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    // 2. Xử lý Cursor logic
    let startIndex = 0;
    if (cursor) {
      // Tìm vị trí của cursor hiện tại
      const idx = allFiltered.findIndex((c) => c.id === cursor);
      if (idx !== -1) {
        startIndex = idx + 1;
      }
    }

    const items = allFiltered.slice(startIndex, startIndex + limit);

    const hasMore = startIndex + limit < allFiltered.length;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      isSuccess: true,
      message: "Tải bình luận thành công",
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
      message: "Lỗi hệ thống khi tải bình luận",
      statusCode: 500,
      errorCode: "SERVER_ERROR",
    };
  }
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
