"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyGroups } from "@/services/group.service";
import type { MyGroupsRequest, MyGroupsResponse } from "@/types/group";

export function useMyGroups(params: MyGroupsRequest = {}) {
    const { data, isLoading, error } = useQuery<MyGroupsResponse[]>({
        queryKey: ["my-groups", params.filterByRole, params.page, params.pageSize],
        queryFn: () => getMyGroups(params),
        staleTime: 1000 * 60,
    });

    return {
        groups: data ?? [],
        isLoading,
        error,
    };
}
