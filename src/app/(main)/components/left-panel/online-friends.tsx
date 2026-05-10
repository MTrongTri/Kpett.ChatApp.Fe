"use client";

import { useSignalR } from "@/components/providers/signalr-provider";
import { UserAvatar } from "@/components/user/user-avatar";
import { useTrackPresence } from "@/hooks/use-track-presence";
import { cn } from "@/lib/utils";
import { getFriendsWithFilter } from "@/services/friend.service";
import { RootState } from "@/store/store";
import { UserProfile } from "@/types/user";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";

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
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const queryClient = useQueryClient();

  const { data: onlineFriends, isLoading, error } = useQuery({
    queryKey: ["online-friends", filterParams],
    queryFn: () => getFriendsWithFilter(filterParams),
    enabled: !!currentUser,
    staleTime: 60 * 1000,
  });

  const targetIds = useMemo(() => !onlineFriends ? [] : onlineFriends.items.map(f => f.id), [onlineFriends]);

  // Xử lý logic Realtime bằng Immer
  const handleStatusChange = useCallback((statusData: { userId: string; isOnline: boolean }) => {

    queryClient.setQueryData(["online-friends", filterParams], (oldData: any) => {
      if (!oldData.items) return oldData;

      return produce(oldData, (draft: any) => {
        // Tìm trực tiếp và thay đổi thuộc tính, Immer sẽ tự động lo việc Immutable
        const friend = draft.items.find((f: UserProfile) => f.id === statusData.userId);
        if (friend) {
          friend.isOnline = statusData.isOnline;
        }
      });
    });
  }, [queryClient, filterParams]);

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

  if (!currentUser) {
    return null;
  }

  if (error || !onlineFriends) {
    return (
      <div className="px-2 py-4 text-xs text-destructive">
        Không thể tải danh sách. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="text-foreground mt-5 mb-2.5 px-2.5 text-sm font-semibold first:mt-0">
        Bạn bè online
      </div>

      {onlineFriends.items.map((friend: UserProfile) => (
        <FriendItem key={friend.id} friend={friend} />
      ))}
    </div>
  );
}