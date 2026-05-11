// src/hooks/user/use-search-users.ts
import { searchUsers } from "@/services/user.service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

// Dùng cho trang Tìm kiếm (Hỗ trợ cuộn vô tận)
export function useSearchUsersInfinite(keyword: string, limit: number = 20) {
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ["search-users-infinite", keyword],
        queryFn: ({ pageParam }) => searchUsers(keyword, limit, pageParam as string | undefined),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.pagination?.nextCursor || undefined,
        enabled: !!keyword.trim(),
    });

    const users = data?.pages.flatMap((page) => page?.items ?? []) ?? [];

    return { users, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage };
}

// Dùng cho Popup thanh tìm kiếm (Giới hạn hiển thị 5 người nhanh nhất)
export function useSearchUsersPreview(keyword: string, limit: number = 5) {
    return useQuery({
        queryKey: ["search-users-preview", keyword],
        queryFn: () => searchUsers(keyword, limit),
        enabled: !!keyword.trim(),
        staleTime: 60 * 1000,
    });
}