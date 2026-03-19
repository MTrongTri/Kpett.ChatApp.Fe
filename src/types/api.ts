export interface ApiResponse<T = any> {
  return: boolean;
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
