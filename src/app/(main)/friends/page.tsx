"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  BellRing,
  Check,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  UserMinus,
  UserPlus,
  UserRoundSearch,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { cn } from "@/lib/utils";
import { chatService } from "@/services/chat.service";
import {
  friendRequest,
  friendRequestAccept,
  friendRequestDecline,
  getFriendSuggestions,
  getFriendsWithFilter,
  unFriend,
} from "@/services/friend.service";
import { notificationService } from "@/services/notification.service";
import { getMyStats, searchUsers } from "@/services/user.service";
import { NotificationResponse } from "@/types/notification";
import { PaginatedData } from "@/types/common/api";
import { BaseUser, UserProfile } from "@/types/user";

const FRIENDS_PAGE_SIZE = 12;

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="border-border bg-card flex min-h-28 flex-col justify-between rounded-3xl border p-5 shadow-sm">
      <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-2xl">
        {icon}
      </div>
      <div className="space-y-1.5">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {formatCompactNumber(value)}
        </div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </div>
      </div>
    </div>
  );
}

function parseMetadata(
  metadata: NotificationResponse["metadata"],
): Record<string, unknown> | null {
  if (!metadata) return null;

  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }

  if (typeof metadata === "object") {
    return metadata as Record<string, unknown>;
  }

  return null;
}

function readStringField(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function getFriendRequestId(notification: NotificationResponse): string | null {
  if (notification.type !== "FriendRequestReceived") return null;

  const metadata = parseMetadata(notification.metadata);

  return (
    readStringField(metadata?.requestId) ||
    readStringField(metadata?.friendRequestId) ||
    readStringField(metadata?.id) ||
    readStringField(notification.referenceId)
  );
}

function getActivityCopy(notification: NotificationResponse) {
  switch (notification.type) {
    case "FriendRequestReceived":
      return "đã gửi cho bạn một lời mời kết bạn.";
    case "FriendRequestAccepted":
      return "đã chấp nhận lời mời kết bạn của bạn.";
    default:
      return "đã tương tác với danh sách bạn bè của bạn.";
  }
}

function getPresenceLabel(friend: UserProfile) {
  if (friend.isOnline) {
    return "Đang hoạt động";
  }

  if (friend.lastActiveAt) {
    return `Hoạt động ${formatRelativeTime(friend.lastActiveAt, {
      style: "short",
      showTime: false,
    })}`;
  }

  if (friend.occupation) {
    return friend.occupation;
  }

  return `@${friend.username}`;
}

function removeBusyKey(
  currentState: Record<string, boolean>,
  key: string,
): Record<string, boolean> {
  const nextState = { ...currentState };
  delete nextState[key];
  return nextState;
}

export default function FriendsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [keyword, setKeyword] = useState("");
  const [busyKeys, setBusyKeys] = useState<Record<string, boolean>>({});

  const debouncedKeyword = useDebounce(keyword, 350);

  const {
    data: myStats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: getMyStats,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: suggestionUsers = [],
    isLoading: isSuggestionsLoading,
    refetch: refetchSuggestions,
    isFetching: isSuggestionsRefreshing,
  } = useQuery({
    queryKey: ["friend-suggestions"],
    queryFn: () => getFriendSuggestions(6),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: relationshipActivity = [],
    isLoading: isActivityLoading,
    refetch: refetchActivity,
    isFetching: isActivityRefreshing,
  } = useQuery({
    queryKey: ["friends-activity"],
    queryFn: () => notificationService.getNotifications(12),
    select: (data) => data.items.filter((item) => item.type.includes("Friend")),
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const {
    data: discoverResults,
    isLoading: isDiscoverLoading,
  } = useQuery({
    queryKey: ["friends-discover", debouncedKeyword],
    queryFn: () => searchUsers(debouncedKeyword, 6),
    enabled: !!user && debouncedKeyword.trim().length >= 2,
    staleTime: 60 * 1000,
  });

  const {
    data: friendsPages,
    isLoading: isFriendsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isFetching: isFriendsRefreshing,
  } = useInfiniteQuery({
    queryKey: ["friends-page", debouncedKeyword],
    queryFn: ({ pageParam }) =>
      getFriendsWithFilter({
        search: debouncedKeyword,
        cursor: (pageParam as string | null) ?? null,
        limit: FRIENDS_PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    enabled: !!user,
  });

  const friends = friendsPages?.pages.flatMap((page) => page.items) ?? [];
  const friendIds = new Set(friends.map((friend) => friend.id));
  const onlineFriends = friends.filter((friend) => friend.isOnline).length;
  const incomingInvites = relationshipActivity.filter(
    (item) => item.type === "FriendRequestReceived",
  ).length;
  const discoverUsers =
    discoverResults?.items.filter(
      (person) => person.id !== user?.id && !friendIds.has(person.id),
    ) ?? [];

  const setBusy = (key: string, isBusy: boolean) => {
    setBusyKeys((currentState) => {
      if (isBusy) {
        return { ...currentState, [key]: true };
      }

      return removeBusyKey(currentState, key);
    });
  };

  const runBusyAction = async (key: string, callback: () => Promise<void>) => {
    setBusy(key, true);

    try {
      await callback();
    } finally {
      setBusy(key, false);
    }
  };

  const refreshRelationshipState = async () => {
    await Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: ["friends-page"] }),
      queryClient.invalidateQueries({ queryKey: ["friend-suggestions"] }),
      queryClient.invalidateQueries({ queryKey: ["friends-activity"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      queryClient.invalidateQueries({ queryKey: ["notifications-unread"] }),
      queryClient.invalidateQueries({ queryKey: ["user-stats"] }),
      queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
      queryClient.invalidateQueries({ queryKey: ["online-friends"] }),
    ]);
  };

  const handleSendFriendRequest = async (person: BaseUser | UserProfile) => {
    if (!user) {
      toast.warning("Bạn cần đăng nhập để gửi lời mời kết bạn.");
      return;
    }

    await runBusyAction(`invite:${person.id}`, async () => {
      try {
        await friendRequest(person.id);
        toast.success(`Đã gửi lời mời cho ${person.displayName || person.username}.`);
        await refreshRelationshipState();
      } catch (error: any) {
        const errorCode = error?.response?.data?.errorCode;
        if (errorCode === 'FRIEND.FRIEND_REQUEST_PENDING') {
          toast.info("Người này đã gửi lời mời kết bạn cho bạn.");
          await refreshRelationshipState();
        } else {
          console.error("[FriendsPage] friendRequest:", error);
          toast.error("Không thể gửi lời mời kết bạn lúc này.");
        }
      }
    });
  };

  const handleUnfriend = async (friend: UserProfile) => {
    const shouldRemove = window.confirm(
      `Gỡ ${friend.displayName || friend.username} khỏi danh sách bạn bè?`,
    );

    if (!shouldRemove) return;

    await runBusyAction(`unfriend:${friend.id}`, async () => {
      try {
        await unFriend(friend.id);
        toast.success("Đã cập nhật danh sách bạn bè.");
        await refreshRelationshipState();
      } catch (error) {
        console.error("[FriendsPage] unFriend:", error);
        toast.error("Không thể gỡ bạn bè vào lúc này.");
      }
    });
  };

  const handleOpenConversation = async (friend: UserProfile) => {
    await runBusyAction(`chat:${friend.id}`, async () => {
      try {
        const conversation = await chatService.getOrCreateDirectConversation(
          friend.id,
        );
        router.push(`/chat/${conversation.id}`);
      } catch (error) {
        console.error("[FriendsPage] getOrCreateDirectConversation:", error);
        toast.error("Không thể mở cuộc trò chuyện.");
      }
    });
  };

  const handleInvitationAction = async (
    notification: NotificationResponse,
    action: "accept" | "decline",
  ) => {
    const requestId = getFriendRequestId(notification);

    if (!requestId) {
      toast.error("Thiếu requestId từ backend nên chưa thể xử lý lời mời này.");
      return;
    }

    await runBusyAction(`${action}:${notification.id}`, async () => {
      try {
        if (action === "accept") {
          await friendRequestAccept(requestId);
        } else {
          await friendRequestDecline(requestId);
        }

        // Xoá notification khỏi cache ngay lập tức để button biến mất,
        // tránh user click "Chấp nhận" lần 2 gây lỗi
        queryClient.setQueryData<PaginatedData<NotificationResponse>>(
          ["friends-activity"],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              items: old.items.filter((item) => item.id !== notification.id),
            };
          },
        );

        await Promise.allSettled([
          notificationService.markAsRead(notification.id),
          refreshRelationshipState(),
        ]);

        toast.success(
          action === "accept"
            ? "Đã chấp nhận lời mời kết bạn."
            : "Đã từ chối lời mời kết bạn.",
        );
      } catch (error: any) {
        const errorCode = error?.response?.data?.errorCode;
        if (errorCode === 'FRIEND.FRIEND_REQUEST_NOT_FOUND') {
          toast.error("Lời mời này không còn tồn tại hoặc đã được xử lý.");
          await refreshRelationshipState();
        } else {
          console.error(`[FriendsPage] ${action} friend request:`, error);
          toast.error("Không thể xử lý lời mời này.");
        }
      }
    });
  };

  if (!user) {
    return (
      <div className="mt-14.5 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="border-border bg-card max-w-md rounded-3xl border p-8 text-center shadow-sm">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Users size={26} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bạn bè</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Đăng nhập để xem danh sách bạn bè, lời mời kết nối và mở cuộc trò
            chuyện nhanh.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild className="rounded-full px-6">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14.5 min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
        <section className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Users size={14} />
                Friends Hub
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Quản lý bạn bè và lời mời kết nối
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Theo dõi danh sách bạn bè, tìm nhanh người quen, xử lý lời mời
                mới và mở chat trực tiếp từ một màn hình.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-3xl border border-border bg-card px-4 py-3 shadow-sm">
              <UserAvatar user={user} className="h-11 w-11" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user.displayName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              icon={<Users size={20} />}
              label="Bạn bè"
              value={myStats?.stats.friends ?? 0}
              hint={
                isStatsLoading
                  ? "Đang tải số lượng kết nối."
                  : "Danh sách bạn bè hiện tại của bạn."
              }
            />
            <StatCard
              icon={<MessageSquare size={20} />}
              label="Đang online"
              value={onlineFriends}
              hint="Số bạn bè đang hiện diện trong danh sách đã tải."
            />
            <StatCard
              icon={<BellRing size={20} />}
              label="Lời mời mới"
              value={incomingInvites}
              hint="Lấy từ notification có liên quan tới bạn bè."
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Danh sách bạn bè
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tìm theo tên hoặc username trong mạng lưới của bạn.
                  </p>
                </div>
                <div className="relative w-full lg:max-w-sm">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Tìm bạn bè..."
                    className="h-11 rounded-full pl-10 pr-4"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {isFriendsLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-border flex items-center gap-4 rounded-2xl border p-4 animate-pulse"
                    >
                      <div className="h-14 w-14 rounded-full bg-muted" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-40 rounded bg-muted" />
                        <div className="h-3 w-28 rounded bg-muted" />
                      </div>
                      <div className="h-9 w-24 rounded-full bg-muted" />
                    </div>
                  ))
                ) : friends.length === 0 ? (
                  <div className="border-border bg-muted/20 rounded-3xl border border-dashed px-5 py-10 text-center">
                    <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                      <UserRoundSearch size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {debouncedKeyword
                        ? "Không có bạn bè nào khớp từ khóa."
                        : "Bạn chưa có bạn bè nào."}
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                      {debouncedKeyword
                        ? "Thử từ khóa khác hoặc xem phần khám phá để kết nối thêm người mới."
                        : "Bắt đầu bằng phần gợi ý bên phải hoặc tìm kiếm người bạn muốn kết nối."}
                    </p>
                  </div>
                ) : (
                  friends.map((friend) => {
                    const unfriendKey = `unfriend:${friend.id}`;
                    const chatKey = `chat:${friend.id}`;

                    return (
                      <div
                        key={friend.id}
                        className="border-border hover:bg-muted/30 flex flex-col gap-4 rounded-3xl border p-4 transition-colors md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <Link href={`/${friend.username}`} className="shrink-0">
                            <UserAvatar
                              user={friend}
                              isShowDotOnline
                              className="h-14 w-14"
                              dotClassName="h-3.5 w-3.5"
                            />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              href={`/${friend.username}`}
                              className="block truncate text-[15px] font-semibold text-foreground hover:text-primary"
                            >
                              {friend.displayName}
                            </Link>
                            <p className="truncate text-sm text-muted-foreground">
                              @{friend.username}
                            </p>
                            <p
                              className={cn(
                                "mt-1 text-xs",
                                friend.isOnline
                                  ? "font-medium text-emerald-600"
                                  : "text-muted-foreground",
                              )}
                            >
                              {getPresenceLabel(friend)}
                            </p>
                            {(friend.biography || friend.location) && (
                              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground/80">
                                {friend.biography || friend.location}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <Button
                            variant="outline"
                            className="rounded-full"
                            disabled={!!busyKeys[chatKey]}
                            onClick={() => handleOpenConversation(friend)}
                          >
                            {busyKeys[chatKey] ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <MessageSquare size={16} />
                            )}
                            Nhắn tin
                          </Button>

                          <Button
                            variant="outline"
                            className="rounded-full text-destructive hover:text-destructive"
                            disabled={!!busyKeys[unfriendKey]}
                            onClick={() => handleUnfriend(friend)}
                          >
                            {busyKeys[unfriendKey] ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <UserMinus size={16} />
                            )}
                            Gỡ bạn
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}

                {friends.length > 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 pt-2">
                    {hasNextPage ? (
                      <Button
                        variant="outline"
                        className="rounded-full px-6"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : null}
                        Xem thêm bạn bè
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Bạn đã xem hết danh sách hiện tại.
                      </p>
                    )}

                    {isFriendsRefreshing && !isFriendsLoading && (
                      <p className="text-xs text-muted-foreground">
                        Đang cập nhật danh sách...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Khám phá thêm người
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Dùng cùng từ khóa để tìm trên toàn hệ thống.
                  </p>
                </div>
                {debouncedKeyword.trim().length >= 2 && (
                  <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Từ khóa: {debouncedKeyword}
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {debouncedKeyword.trim().length < 2 ? (
                  <div className="border-border bg-muted/20 rounded-3xl border border-dashed px-5 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nhập ít nhất 2 ký tự ở ô tìm kiếm phía trên để tìm người
                      ngoài danh sách bạn bè.
                    </p>
                  </div>
                ) : isDiscoverLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-border flex items-center gap-4 rounded-2xl border p-4 animate-pulse"
                    >
                      <div className="h-12 w-12 rounded-full bg-muted" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-muted" />
                        <div className="h-3 w-24 rounded bg-muted" />
                      </div>
                      <div className="h-9 w-20 rounded-full bg-muted" />
                    </div>
                  ))
                ) : discoverUsers.length === 0 ? (
                  <div className="border-border bg-muted/20 rounded-3xl border border-dashed px-5 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Không tìm thấy người phù hợp ngoài mạng lưới hiện tại.
                    </p>
                  </div>
                ) : (
                  discoverUsers.map((person) => {
                    const inviteKey = `invite:${person.id}`;

                    return (
                      <div
                        key={person.id}
                        className="border-border hover:bg-muted/30 flex items-center justify-between gap-4 rounded-2xl border p-4 transition-colors"
                      >
                        <Link
                          href={`/${person.username}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          <UserAvatar
                            user={{
                              id: person.id,
                              username: person.username,
                              displayName: person.displayName,
                              avatarUrl: person.avatarUrl,
                            }}
                            className="h-12 w-12"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {person.displayName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              @{person.username}
                            </p>
                          </div>
                        </Link>

                        <Button
                          className="rounded-full"
                          disabled={!!busyKeys[inviteKey]}
                          onClick={() => handleSendFriendRequest(person)}
                        >
                          {busyKeys[inviteKey] ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <UserPlus size={16} />
                          )}
                          Kết bạn
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Hoạt động kết nối
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Lấy từ luồng notification liên quan tới bạn bè.
                  </p>
                </div>
                <button
                  type="button"
                  title="Tải lại hoạt động"
                  onClick={() => refetchActivity()}
                  disabled={isActivityRefreshing}
                  className="text-muted-foreground hover:text-foreground rounded-full p-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={cn(isActivityRefreshing && "animate-spin")}
                  />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {isActivityLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-border flex gap-3 rounded-2xl border p-4 animate-pulse"
                    >
                      <div className="h-11 w-11 rounded-full bg-muted" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-1/2 rounded bg-muted" />
                      </div>
                    </div>
                  ))
                ) : relationshipActivity.length === 0 ? (
                  <div className="border-border bg-muted/20 rounded-3xl border border-dashed px-5 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Chưa có cập nhật nào về lời mời hoặc chấp nhận kết bạn.
                    </p>
                  </div>
                ) : (
                  relationshipActivity.map((notification) => {
                    const requestId = getFriendRequestId(notification);
                    const acceptKey = `accept:${notification.id}`;
                    const declineKey = `decline:${notification.id}`;
                    const actorName =
                      notification.actor?.displayName ||
                      notification.actor?.username ||
                      "Người dùng";

                    return (
                      <div
                        key={notification.id}
                        className="border-border rounded-2xl border p-4"
                      >
                        <div className="flex gap-3">
                          <Link
                            href={`/${notification.actor?.username ?? ""}`}
                            className="shrink-0"
                          >
                            <UserAvatar
                              user={{
                                id: notification.actor?.id || notification.id,
                                username: notification.actor?.username || "",
                                displayName:
                                  notification.actor?.displayName || "Người dùng",
                                avatarUrl: notification.actor?.avatarUrl,
                              }}
                              className="h-11 w-11"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/${notification.actor?.username ?? ""}`}
                              className="line-clamp-2 text-sm leading-relaxed text-foreground"
                            >
                              <span className="font-semibold">{actorName}</span>{" "}
                              {getActivityCopy(notification)}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatRelativeTime(notification.createdAt)}
                            </p>

                            {notification.type === "FriendRequestReceived" ? (
                              requestId ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    className="rounded-full"
                                    disabled={!!busyKeys[acceptKey] || !!busyKeys[declineKey]}
                                    onClick={() =>
                                      handleInvitationAction(
                                        notification,
                                        "accept",
                                      )
                                    }
                                  >
                                    {busyKeys[acceptKey] ? (
                                      <Loader2
                                        className="animate-spin"
                                        size={14}
                                      />
                                    ) : (
                                      <Check size={14} />
                                    )}
                                    Chấp nhận
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full"
                                    disabled={!!busyKeys[acceptKey] || !!busyKeys[declineKey]}
                                    onClick={() =>
                                      handleInvitationAction(
                                        notification,
                                        "decline",
                                      )
                                    }
                                  >
                                    {busyKeys[declineKey] ? (
                                      <Loader2
                                        className="animate-spin"
                                        size={14}
                                      />
                                    ) : (
                                      <X size={14} />
                                    )}
                                    Từ chối
                                  </Button>
                                </div>
                              ) : (
                                <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
                                  Backend chưa trả requestId trong notification
                                  này, nên hiện chỉ có thể mở hồ sơ để xử lý từ
                                  trang cá nhân.
                                </p>
                              )
                            ) : (
                              <div className="mt-3">
                                <Button asChild variant="outline" size="sm" className="rounded-full">
                                  <Link href={`/${notification.actor?.username ?? ""}`}>
                                    Xem hồ sơ
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Gợi ý cho bạn
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Những người có thể phù hợp để kết nối tiếp theo.
                  </p>
                </div>
                <button
                  type="button"
                  title="Tải lại gợi ý"
                  onClick={() => refetchSuggestions()}
                  disabled={isSuggestionsRefreshing}
                  className="text-muted-foreground hover:text-foreground rounded-full p-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={cn(isSuggestionsRefreshing && "animate-spin")}
                  />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {isSuggestionsLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="border-border flex items-center gap-3 rounded-2xl border p-3 animate-pulse"
                    >
                      <div className="h-11 w-11 rounded-full bg-muted" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-muted" />
                        <div className="h-3 w-20 rounded bg-muted" />
                      </div>
                      <div className="h-9 w-20 rounded-full bg-muted" />
                    </div>
                  ))
                ) : suggestionUsers.length === 0 ? (
                  <div className="border-border bg-muted/20 rounded-3xl border border-dashed px-5 py-8 text-center">
                    <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl">
                      <Sparkles size={20} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Không còn gợi ý phù hợp ở thời điểm hiện tại.
                    </p>
                  </div>
                ) : (
                  suggestionUsers.map((person) => {
                    const inviteKey = `invite:${person.id}`;

                    return (
                      <div
                        key={person.id}
                        className="border-border hover:bg-muted/30 flex items-center justify-between gap-3 rounded-2xl border p-3 transition-colors"
                      >
                        <Link
                          href={`/${person.username}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          <UserAvatar user={person} className="h-11 w-11" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {person.displayName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              @{person.username}
                            </p>
                          </div>
                        </Link>

                        <Button
                          size="sm"
                          className="rounded-full"
                          disabled={!!busyKeys[inviteKey]}
                          onClick={() => handleSendFriendRequest(person)}
                        >
                          {busyKeys[inviteKey] ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <UserPlus size={14} />
                          )}
                          Thêm
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
