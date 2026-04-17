import { useMemo } from "react";
import useSWRInfinite from "swr/infinite";
import { getPostsByUserId } from "@/services/post.service";
import { ApiResponse, PaginatedData } from "@/types/common/api";
import { PostThumbnail } from "@/types/post";

export type ProfileTab = "Post" | "Reel" | "Saved";

const PAGE_SIZE = 6;

type PostInfiniteKey = [string, string, ProfileTab, string | null];

const getKey = (
    pageIndex: number,
    previousPageData: ApiResponse<PaginatedData<PostThumbnail>> | null,
    userId: string,
    tab: ProfileTab,
): PostInfiniteKey | null => {
    if (
        previousPageData &&
        (!previousPageData.data || !previousPageData.data.pagination.hasMore)
    ) {
        return null;
    }

    const cursor =
        pageIndex === 0
            ? null
            : (previousPageData?.data?.pagination.nextCursor ?? null);

    return ["profile-posts", userId, tab, cursor];
};

export const useProfilePosts = (userId: string, tab: ProfileTab) => {
    const { data, size, setSize, error, isLoading, isValidating, mutate } =
        useSWRInfinite(
            (index, prev) => getKey(index, prev, userId, tab),
            ([_, user, currentTab, cursor]: PostInfiniteKey) =>
                getPostsByUserId(user, currentTab, cursor, PAGE_SIZE),
            {
                revalidateOnFocus: true,
                shouldRetryOnError: false,
                persistSize: false,
            },
        );

    // Gộp tất cả các trang lại thành một mảng duy nhất
    const posts = useMemo(() => {
        return data ? data.flatMap((page) => page.data?.items || []) : [];
    }, [data]);

    const hasMore = data
        ? data[data.length - 1]?.data?.pagination.hasMore ?? false
        : false;

    const isInitialLoading = isLoading && !data;
    const isLoadingMore = isValidating && size > 0;

    // Hàm load thêm trang an toàn
    const loadMore = () => {
        if (hasMore && !isValidating) {
            setSize(size + 1);
        }
    };

    return {
        posts,
        isInitialLoading,
        isLoadingMore,
        hasMore,
        error,
        loadMore,
        mutate,
    };
};