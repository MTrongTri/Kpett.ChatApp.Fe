// components/online-friends.tsx
"use client";

import { useSignalR } from "@/components/providers/signalr-provider";
import { UserAvatar } from "@/components/user/user-avatar";
import { useTrackPresence } from "@/hooks/use-track-presence";
import { cn } from "@/lib/utils";
import { getFriendsWithFilter } from "@/services/friend.service";
import { UserProfile } from "@/types/user";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import useSWR from "swr";

const FriendItem = ({ friend }: { friend: UserProfile }) => (
  <Link href={friend.username}>
    <button
      className="hover:bg-foreground/5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Xem hồ sơ của ${friend.displayName || friend.username}`}
    >
      <div className="shrink-0">
        <UserAvatar user={friend} isShowDotOnline={true} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-card-foreground truncate text-[12.5px] leading-tight font-medium">
          {friend.displayName || friend.username}
        </p>
        <p
          className={cn(
            "mt-0.5 text-[10px] truncate",
            friend.isOnline ? "text-emerald-500" : "text-foreground/40"
          )}
        >
          {(friend.isOnline ? "Đang hoạt động" : "Ngoại tuyến")}
        </p>
      </div>
    </button>
  </Link>
);

const FriendSkeleton = () => (
  <div className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2">
    <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-foreground/10" />
    <div className="flex flex-1 flex-col gap-1.5 min-w-0">
      <div className="h-3.5 w-24 animate-pulse rounded-md bg-foreground/10" />
      <div className="h-2.5 w-16 animate-pulse rounded-md bg-foreground/10" />
    </div>
  </div>
);

export default function OnlineFriends() {
  const filterParams = useMemo(() => ({ search: "", cursor: null, limit: 10 }), []);
  const { connection, isConnected } = useSignalR();

  const { data, isLoading, error, mutate } = useSWR(
    ["online-friends", filterParams],
    ([, params]) => getFriendsWithFilter(params),
    {
      revalidateOnFocus: false,
    }
  );

  const onlineFriends: UserProfile[] = data?.data?.items || [];

  const targetIds = useMemo(() => onlineFriends.map(f => f.id), [onlineFriends]);

  const handleStatusChange = useCallback((statusData: { userId: string; isOnline: boolean }) => {
    mutate((currentData: any) => {
      if (!currentData?.data?.items) return currentData;

      return {
        ...currentData,
        data: {
          ...currentData.data,
          items: currentData.data.items.map((friend: UserProfile) =>
            friend.id === statusData.userId
              ? { ...friend, isOnline: statusData.isOnline }
              : friend
          ),
        },
      };
    }, { revalidate: false });
  }, [mutate]);

  useTrackPresence(targetIds, handleStatusChange);

  // Render logic
  if (isLoading) {
    return (
      <div className="space-y-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <FriendSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error || !data || !data.data?.items) {
    return (
      <div className="px-2 py-4 text-center text-xs text-destructive">
        Không thể tải danh sách. Vui lòng thử lại.
      </div>
    );
  }

  if (onlineFriends.length === 0) {
    return (
      <div className="px-2 py-4 text-center text-xs text-muted-foreground">
        Không có bạn bè nào đang trực tuyến.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {onlineFriends.map((friend: UserProfile) => (
        <FriendItem key={friend.id} friend={friend} />
      ))}
    </div>
  );
}