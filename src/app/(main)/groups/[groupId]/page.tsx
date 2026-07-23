"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { openPostEditorModal } from "@/store/features/modal-slice";
import PostCard from "@/app/(main)/components/posts/post-card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Check,
  Crown,
  Globe2,
  Image as ImageIcon,
  Link2,
  Loader2,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Smile,
  ThumbsUp,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { getGroupDetailById, joinGroup, leaveGroup, getGroupPosts, getGroupMembers, inviteMembers } from "@/services/group.service";
import { getFriendsWithFilter } from "@/services/friend.service";
import { useDebounce } from "@/hooks/use-debounce";
import type { GroupDetailResponse } from "@/types/group";
import type { UserProfile } from "@/types/user";

// ── Tab Types ──

type GroupTab = "home" | "about" | "discussion" | "members";

const TABS: { key: GroupTab; label: string }[] = [
  { key: "home", label: "Trang chủ" },
  { key: "about", label: "Giới thiệu" },
  { key: "discussion", label: "Thảo luận" },
  { key: "members", label: "Thành viên" },
];

// ── Helpers ──

function getPrivacyLabel(type: string) {
  switch (type) {
    case "public":
      return "Nhóm công khai";
    case "private":
      return "Nhóm riêng tư";
    case "hidden":
      return "Nhóm ẩn";
    default:
      return type;
  }
}

function PrivacyIcon({ type, size = 16 }: { type: string; size?: number }) {
  if (type === "public") return <Globe2 size={size} className="text-emerald-500" />;
  return <Lock size={size} className="text-amber-500" />;
}

function getRoleLabel(role: string | null) {
  switch (role) {
    case "admin":
      return { label: "Quản trị viên", icon: Crown, color: "text-amber-600 bg-amber-50 border-amber-200" };
    case "moderator":
      return { label: "Kiểm duyệt viên", icon: Shield, color: "text-blue-600 bg-blue-50 border-blue-200" };
    case "member":
      return { label: "Thành viên", icon: UserCheck, color: "text-gray-600 bg-gray-50 border-gray-200" };
    default:
      return null;
  }
}

// ── Loading Skeleton ──

function GroupDetailSkeleton() {
  return (
    <div className="mt-14.5 min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-5xl">
        {/* Cover skeleton */}
        <div className="h-[200px] md:h-[260px] bg-muted animate-pulse rounded-b-3xl relative z-0" />
        {/* Header skeleton */}
        <div className="px-4 md:px-8 -mt-12 md:-mt-16 space-y-4 relative z-10">
          <div className="flex items-end gap-5">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-muted border-4 border-background animate-pulse" />
            <div className="space-y-2 flex-1 pb-2">
              <div className="h-7 w-64 bg-muted rounded animate-pulse" />
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-muted rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Placeholder Post ──

function PostComposer({ user, groupId }: { user: any, groupId: string }) {
  const dispatch = useDispatch();

  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
      <div className="flex gap-3 mb-4">
        <UserAvatar user={user} className="h-11 w-11" />
        <div 
          onClick={() => dispatch(openPostEditorModal({ mode: "create", groupId }))}
          className="flex-1 bg-muted/50 hover:bg-muted border border-border transition-colors rounded-2xl px-5 py-3 text-muted-foreground text-[15px] cursor-pointer flex items-center font-medium"
        >
          Chia sẻ điều gì đó với nhóm...
        </div>
      </div>
      <div className="border-t border-border pt-3 flex justify-between px-1">
        <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground font-semibold text-[14px] py-2 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
          <ImageIcon size={20} className="text-emerald-500" /> Ảnh/Video
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground font-semibold text-[14px] py-2 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors">
          <Smile size={20} className="text-yellow-500" /> Cảm xúc
        </button>
      </div>
    </div>
  );
}

function PlaceholderPost() {
  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-muted animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        </div>
        <MoreHorizontal size={18} className="text-muted-foreground" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3.5 w-full bg-muted/60 rounded animate-pulse" />
        <div className="h-3.5 w-4/5 bg-muted/60 rounded animate-pulse" />
        <div className="h-3.5 w-3/5 bg-muted/60 rounded animate-pulse" />
      </div>
      <div className="h-52 w-full bg-muted/30 rounded-2xl animate-pulse" />
      <div className="mt-4 pt-3 border-t border-border flex gap-1">
        <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium py-2 rounded-xl hover:bg-muted/50 transition-colors">
          <ThumbsUp size={18} /> Thích
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium py-2 rounded-xl hover:bg-muted/50 transition-colors">
          <MessageCircle size={18} /> Bình luận
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 text-muted-foreground text-sm font-medium py-2 rounded-xl hover:bg-muted/50 transition-colors">
          <Share2 size={18} /> Chia sẻ
        </button>
      </div>
    </div>
  );
}

// ── Tab Content ──

function TabHome({ group, user }: { group: GroupDetailResponse; user: any }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["group-posts", group.id],
    queryFn: ({ pageParam = null }: { pageParam: string | null }) => getGroupPosts(group.id, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
  });

  const posts = data?.pages.flatMap(page => page.items) || [];

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Main feed */}
      <div className="flex-1 min-w-0 space-y-4">
        {user && group.isMember && <PostComposer user={user} groupId={group.id} />}
        
        {status === "pending" && (
          <>
            <PlaceholderPost />
            <PlaceholderPost />
          </>
        )}

        {status === "success" && posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        
        {status === "success" && posts.length === 0 && (
           <div className="text-center text-muted-foreground py-10 bg-card rounded-3xl border border-border">
             Chưa có bài viết nào trong nhóm này.
           </div>
        )}

        {hasNextPage && (
          <div className="flex justify-center mt-4">
            <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant="ghost" className="rounded-full">
              {isFetchingNextPage ? <Loader2 className="animate-spin mr-2" /> : "Tải thêm"}
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-[320px] shrink-0 space-y-4">
        {/* About widget */}
        <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
          <h3 className="text-[15px] font-bold text-foreground mb-3">
            Về nhóm này
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {group.description || "Nhóm này chưa có mô tả. Quản trị viên có thể cập nhật thông tin tại phần cài đặt."}
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-foreground">
              <PrivacyIcon type={group.type} size={18} />
              <div>
                <p className="font-semibold">{getPrivacyLabel(group.type)}</p>
                <p className="text-xs text-muted-foreground">
                  {group.type === "public"
                    ? "Ai cũng có thể thấy các bài viết."
                    : "Chỉ thành viên mới xem được nội dung."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Users size={18} className="text-primary shrink-0" />
              <div>
                <p className="font-semibold">
                  {formatCompactNumber(group.memberCount)} thành viên
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Calendar size={18} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground">
                  Tạo ngày {formatRelativeTime(group.createdAt, { style: "absolute", showTime: false })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
          <h3 className="text-[15px] font-bold text-foreground mb-3">
            Quy tắc nhóm
          </h3>
          {group.rules && group.rules.length > 0 ? (
            <ol className="space-y-2">
              {group.rules.map((rule) => (
                <li key={rule.id} className="flex gap-2 text-sm">
                  <span className="font-bold text-primary shrink-0 mt-0.5">{rule.order}.</span>
                  <div>
                    <span className="font-semibold text-foreground">{rule.title}</span>
                    {rule.description && (
                      <p className="text-muted-foreground mt-0.5 text-[13px]">{rule.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-2xl p-4 border border-border/50">
              Nhóm chưa có quy tắc nào. Quản trị viên sẽ cập nhật sau.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabAbout({ group }: { group: GroupDetailResponse }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-card rounded-3xl border border-border p-6 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-foreground">Giới thiệu</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {group.description || "Nhóm này chưa có mô tả chi tiết."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-4 border border-border/50">
            <PrivacyIcon type={group.type} size={20} />
            <div>
              <p className="text-sm font-semibold text-foreground">{getPrivacyLabel(group.type)}</p>
              <p className="text-xs text-muted-foreground">
                {group.type === "public"
                  ? "Hiển thị với tất cả mọi người"
                  : "Chỉ thành viên mới thấy nội dung"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-4 border border-border/50">
            <Users size={20} className="text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{formatCompactNumber(group.memberCount)} thành viên</p>
              <p className="text-xs text-muted-foreground">Tham gia cộng đồng</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-4 border border-border/50">
            <Calendar size={20} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {formatRelativeTime(group.createdAt, { style: "absolute", showTime: false })}
              </p>
              <p className="text-xs text-muted-foreground">Ngày thành lập</p>
            </div>
          </div>
          {group.slug && (
            <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-4 border border-border/50">
              <Link2 size={20} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold text-foreground truncate">kpett.app/groups/{group.slug}</p>
                <p className="text-xs text-muted-foreground">Liên kết nhóm</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabDiscussion({ group, user }: { group: GroupDetailResponse; user: any }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ["group-posts", group.id],
    queryFn: ({ pageParam = null }: { pageParam: string | null }) => getGroupPosts(group.id, pageParam),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
  });

  const posts = data?.pages.flatMap(page => page.items) || [];

  return (
    <div className="max-w-2xl space-y-4">
      {user && group.isMember && <PostComposer user={user} groupId={group.id} />}

      {status === "pending" && (
        <>
          <PlaceholderPost />
          <PlaceholderPost />
        </>
      )}

      {status === "success" && posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}

      {status === "success" && posts.length === 0 && (
        <div className="border-border bg-muted/20 rounded-3xl border border-dashed px-5 py-10 text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <MessageCircle size={24} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Chưa có bài thảo luận nào</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Hãy là người đầu tiên chia sẻ suy nghĩ với cộng đồng!
          </p>
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} variant="ghost" className="rounded-full">
            {isFetchingNextPage ? <Loader2 className="animate-spin mr-2" /> : "Tải thêm"}
          </Button>
        </div>
      )}
    </div>
  );
}

function TabMembers({ group }: { group: GroupDetailResponse }) {
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<UserProfile[]>([]);
  const [isFriendInputFocused, setIsFriendInputFocused] = useState(false);
  const debouncedFriendSearch = useDebounce(friendSearch, 300);

  const { data: friendsData, isLoading: isSearchingFriends } = useQuery({
    queryKey: ["friends-search-invite", debouncedFriendSearch],
    queryFn: () => getFriendsWithFilter({ search: debouncedFriendSearch, cursor: null, limit: 10 }),
    enabled: showInvite,
  });

  const friendSuggestions = friendsData?.items?.filter(
    friend => !selectedFriends.some(selected => selected.id === friend.id)
  ) || [];

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["group-members-public", group.id],
    queryFn: () => getGroupMembers(group.id, { pageSize: 20 }),
    enabled: !!group.id,
    staleTime: 60 * 1000,
  });

  const { mutate: sendInvite, isPending: isInviting } = useMutation({
    mutationFn: (userIds: string[]) => inviteMembers(group.id, userIds),
    onSuccess: (data) => {
      const result = data as { invitedCount: number; skipped: { reason: string }[] } | undefined;
      const invited = result?.invitedCount ?? 0;
      const skipped = result?.skipped ?? [];
      let message = `Đã mời ${invited} người thành công.`;
      if (skipped.length > 0) {
        const reasons = [...new Set(skipped.map((s) => s.reason))];
        const reasonText = reasons.join(", ");
        message += ` ${skipped.length} người bỏ qua (${reasonText}).`;
        if (reasons.includes("not_friend")) {
          message += " Chỉ có thể mời bạn bè.";
        }
      }
      toast.success(message);
      setShowInvite(false);
      setFriendSearch("");
      setSelectedFriends([]);
      queryClient.invalidateQueries({ queryKey: ["group-members-public", group.id] });
    },
    onError: () => toast.error("Không thể gửi lời mời."),
  });

  const members = membersData?.items ?? [];

  function getRoleIcon(role: string) {
    switch (role) {
      case "admin": return <Crown size={14} className="text-amber-500" />;
      case "moderator": return <Shield size={14} className="text-blue-500" />;
      default: return null;
    }
  }

  const handleInvite = () => {
    const userIds = selectedFriends.map(f => f.id);
    if (userIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một người bạn.");
      return;
    }
    sendInvite(userIds);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">
            Thành viên ({formatCompactNumber(group.memberCount)})
          </h3>
          {group.isMember && (
            <Button variant="outline" className="rounded-full gap-2" size="sm" onClick={() => setShowInvite(!showInvite)}>
              <UserPlus size={14} />
              Mời
            </Button>
          )}
        </div>

        {showInvite && (
          <div className="mb-4 p-4 bg-muted/30 rounded-2xl border border-border space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Tìm kiếm bạn bè để mời:</p>

            {selectedFriends.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFriends.map(friend => (
                  <div key={friend.id} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 pl-1.5 pr-2 py-1 rounded-full text-xs font-semibold text-primary">
                    <UserAvatar user={friend} className="w-5 h-5" />
                    <span>{friend.displayName || friend.username}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFriends(prev => prev.filter(p => p.id !== friend.id))}
                      className="text-primary/60 hover:text-primary ml-0.5"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                onFocus={() => setIsFriendInputFocused(true)}
                onBlur={() => setTimeout(() => setIsFriendInputFocused(false), 200)}
                className="w-full pl-9 pr-3 h-9 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
                placeholder="Nhập tên bạn bè..."
              />
              {isSearchingFriends && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={14} className="animate-spin text-primary" />
                </div>
              )}
            </div>

            {isFriendInputFocused && (
              <div className="max-h-[200px] overflow-y-auto space-y-1 -mx-1 px-1">
                {friendSuggestions.length > 0 ? (
                  friendSuggestions.map(friend => (
                    <div
                      key={friend.id}
                      onClick={() => {
                        setSelectedFriends(prev => [...prev, friend]);
                        setFriendSearch('');
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar user={friend} className="w-8 h-8" />
                        <div>
                          <div className="text-sm font-semibold">{friend.displayName || friend.username}</div>
                          <div className="text-xs text-muted-foreground">@{friend.username}</div>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedFriends.some(s => s.id === friend.id) ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                        {selectedFriends.some(s => s.id === friend.id) && <Check size={12} className="text-primary-foreground" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4 text-sm">
                    {debouncedFriendSearch ? "Không tìm thấy bạn bè" : "Gõ tên để tìm kiếm bạn bè"}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button size="sm" className="rounded-xl gap-1.5 flex-1" onClick={handleInvite} disabled={isInviting || selectedFriends.length === 0}>
                {isInviting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {isInviting ? "Đang mời..." : `Mời (${selectedFriends.length})`}
              </Button>
              <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => { setShowInvite(false); setSelectedFriends([]); setFriendSearch(""); }}>
                Hủy
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="border-border bg-muted/20 rounded-2xl border border-dashed px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">Chưa có thành viên nào.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {members.map((member) => (
              <div key={member.userId} className="flex items-center gap-3 p-2.5 hover:bg-muted/30 rounded-xl transition-colors">
                <UserAvatar
                  user={{
                    id: member.userId,
                    username: member.username || "",
                    displayName: member.displayName || member.username || "",
                    avatarUrl: null,
                  }}
                  className="h-10 w-10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {member.displayName || member.username}
                    {getRoleIcon(member.role)}
                  </p>
                  <p className="text-xs text-muted-foreground">@{member.username}</p>
                </div>
                {member.role === "admin" && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                    Quản trị
                  </span>
                )}
                {member.role === "moderator" && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                    Kiểm duyệt
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const groupId = params.groupId as string;
  const [activeTab, setActiveTab] = useState<GroupTab>("home");

  const {
    data: group,
    isLoading,
    isError,
  } = useQuery<GroupDetailResponse>({
    queryKey: ["group-detail", groupId],
    queryFn: () => getGroupDetailById(groupId),
    enabled: !!groupId,
    staleTime: 60 * 1000,
  });

  const { mutate: handleJoinGroup, isPending: isJoining } = useMutation({
    mutationFn: () => joinGroup(groupId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["group-detail", groupId] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      if (data.status === "pending") {
        toast.success("Đã gửi yêu cầu tham gia. Vui lòng chờ phê duyệt.");
      } else {
        toast.success("Đã tham gia nhóm thành công.");
      }
    },
    onError: () => toast.error("Có lỗi xảy ra khi tham gia nhóm.")
  });

  const { mutate: handleLeaveGroup, isPending: isLeaving } = useMutation({
    mutationFn: () => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-detail", groupId] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast.success("Đã rời khỏi nhóm.");
    },
    onError: () => toast.error("Có lỗi xảy ra khi rời nhóm.")
  });

  if (isLoading) return <GroupDetailSkeleton />;

  if (isError || !group) {
    return (
      <div className="mt-14.5 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="border-border bg-card max-w-md rounded-3xl border p-8 text-center shadow-sm">
          <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Users size={26} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Không tìm thấy nhóm</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Nhóm này có thể đã bị xóa hoặc bạn không có quyền truy cập.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href="/groups">Quay lại danh sách nhóm</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const role = getRoleLabel(group.myRole);
  const isAdmin = group.myRole === "admin";

  return (
    <div className="mt-14.5 min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-5xl">

        {/* ── Cover Image ── */}
        <div className="relative z-0">
          {group.coverImageUrl ? (
            <div className="h-[200px] md:h-[260px] overflow-hidden rounded-b-3xl">
              <img
                src={group.coverImageUrl}
                alt={`${group.name} cover`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : group.avatarUrl ? (
            <div className="h-[200px] md:h-[260px] overflow-hidden rounded-b-3xl">
              <img
                src={group.avatarUrl}
                alt={`${group.name} cover`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-[200px] md:h-[260px] overflow-hidden rounded-b-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 -left-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
                <div className="bg-white/10 p-6 md:p-8 rounded-[2rem] backdrop-blur-md border border-white/20 shadow-xl">
                  <ImageIcon className="text-white/90 w-20 h-20 md:w-24 md:h-24" />
                </div>
              </div>
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => router.push("/groups")}
            className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors z-10"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Admin settings */}
          {isAdmin && (
            <Link href={`/groups/${groupId}/manage`} className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors z-10">
              <Settings size={20} />
            </Link>
          )}
        </div>

        {/* ── Group Header ── */}
        <div className="px-4 md:px-8 pb-0 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            {/* Avatar */}
            <div className="shrink-0 relative">
              {group.avatarUrl ? (
                <div className="h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
                  <img src={group.avatarUrl} alt={group.name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-28 w-28 md:h-32 md:w-32 rounded-full border-4 border-background shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                  {(group.name || "G").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {group.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <PrivacyIcon type={group.type} />
                  {getPrivacyLabel(group.type)}
                </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="font-medium">
                  {formatCompactNumber(group.memberCount)} thành viên
                </span>
                {role && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", role.color)}>
                      <role.icon size={12} />
                      {role.label}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-2 shrink-0">
              {group.isMember ? (
                <Button 
                  variant="outline" 
                  className="rounded-full gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" 
                  onClick={() => {
                    if (window.confirm("Bạn có chắc chắn muốn rời nhóm này?")) {
                      handleLeaveGroup();
                    }
                  }}
                  disabled={isLeaving}
                >
                  {isLeaving ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  {isLeaving ? "Đang rời..." : "Đã tham gia"}
                </Button>
              ) : (
                <Button 
                  className="rounded-full gap-2" 
                  onClick={() => handleJoinGroup()}
                  disabled={isJoining}
                >
                  {isJoining ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  {isJoining ? "Đang xử lý..." : "Tham gia nhóm"}
                </Button>
              )}
              <Button variant="outline" size="icon" className="rounded-full">
                <Share2 size={16} />
              </Button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mt-4 border-b border-border">
            <div className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 rounded-t-lg",
                    activeTab === tab.key
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="px-4 md:px-8 py-6">
          {activeTab === "home" && <TabHome group={group} user={user} />}
          {activeTab === "about" && <TabAbout group={group} />}
          {activeTab === "discussion" && <TabDiscussion group={group} user={user} />}
          {activeTab === "members" && <TabMembers group={group} />}
        </div>
      </div>
    </div>
  );
}
