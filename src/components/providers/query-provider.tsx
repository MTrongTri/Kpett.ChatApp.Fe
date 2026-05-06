// components/providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { ApiResponse } from "@/types/common/api";
import { toast } from "sonner";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => {
        const handleSystemError = (error: any) => {
            const apiError = error as ApiResponse;

            const isServerError = apiError.statusCode >= 500;
            const isNetworkError = apiError.errorCode === "NETWORK_ERROR" || apiError.errorCode === "TIMEOUT_ERROR";

            if (isServerError) {
                if (typeof window !== "undefined") {
                    window.location.href = "/error/server-error";
                }
            }
            else if (isNetworkError) {
                toast.error("Vui lòng kiểm tra kết nối mạng")
            }
        };

        return new QueryClient({
            queryCache: new QueryCache({
                onError: handleSystemError,
            }),
            mutationCache: new MutationCache({
                onError: handleSystemError,
            }),
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false,
                    retry: 1,
                    staleTime: 60 * 1000,
                },
            },
        });
    });

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}