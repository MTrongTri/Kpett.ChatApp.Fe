export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  data?: T;
  statusCode: number;
  errorCode?: string;
}

export interface CursorPaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
  limit: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: CursorPaginationMeta;
}

export interface ApiErrorData {
  errorCode?: string;
  message?: string;
}

export interface ApiErrorResponse {
  response?: {
    data?: ApiErrorData;
  };
}
