import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostsByUserId } from "@/services/post.service";
import { PostThumbnail } from "@/types/post";

export type ProfileTab = "Post" | "Reel" | "Saved";

const PAGE_SIZE = 6;

export const useProfilePosts = (userId: string, tab: ProfileTab) => {
    const {
        data,
        error,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["posts-profile", userId, tab],

        queryFn: ({ pageParam }) =>
            getPostsByUserId(userId, tab, pageParam as string | null, PAGE_SIZE),

        initialPageParam: null as string | null,

        getNextPageParam: (lastPage) => {
            const pagination = lastPage.pagination;
            return pagination?.hasMore ? pagination.nextCursor : undefined;
        },

        enabled: !!userId,
        refetchOnWindowFocus: true,
        retry: false,
    });

    // Gộp tất cả các trang lại thành một mảng duy nhất
    const posts = useMemo(() => {
        return data?.pages.flatMap((page) => page.items || []) ?? [];
    }, [data]);

    // Hàm load thêm trang an toàn
    const loadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return {
        posts,
        isInitialLoading: isLoading,
        isLoadingMore: isFetchingNextPage,
        hasMore: !!hasNextPage,
        error,
        loadMore,
        mutate: refetch,
    };
};