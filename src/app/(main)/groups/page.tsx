"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Globe2,
  Lock,
  Loader2,
  Users,
  Plus,
  Search,
  Crown,
  Shield,
  UserCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { cn } from "@/lib/utils";
import { getMyGroups, searchGroups } from "@/services/group.service";
import type { MyGroupItem, SearchGroupItem } from "@/types/group";

// ── Helpers ──

function getPrivacyLabel(privacy: number | string) {
  if (privacy === 0 || privacy === "public") return "Công khai";
  if (privacy === 1 || privacy === "private") return "Riêng tư";
  return "Ẩn";
}

function PrivacyIcon({ privacy, className }: { privacy: number | string; className?: string }) {
  if (privacy === 0 || privacy === "public") {
    return <Globe2 size={14} className={cn("text-emerald-500", className)} />;
  }
  return <Lock size={14} className={cn("text-amber-500", className)} />;
}

function getRoleBadge(role: number) {
  switch (role) {
    case 2:
      return { label: "Quản trị", icon: Crown, color: "text-amber-600 bg-amber-50 border-amber-100" };
    case 1:
      return { label: "Kiểm duyệt", icon: Shield, color: "text-blue-600 bg-blue-50 border-blue-100" };
    default:
      return { label: "Thành viên", icon: UserCheck, color: "text-gray-600 bg-gray-50 border-gray-100" };
  }
}

function GroupAvatar({ name, avatarUrl, className }: { name: string | null; avatarUrl: string | null; className?: string }) {
  if (avatarUrl) {
    return (
      <div className={cn("shrink-0 overflow-hidden rounded-2xl", className)}>
        <img src={avatarUrl} alt={name || "Group"} className="h-full w-full object-cover" />
      </div>
    );
  }

  const initial = (name || "G").charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-sm",
        className,
      )}
    >
      <span className="text-lg">{initial}</span>
    </div>
  );
}

// ── Stat Card ──

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div className="border-border bg-card flex flex-col justify-between rounded-3xl border p-5 shadow-sm min-h-[7rem]">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", accent)}>
        {icon}
      </div>
      <div className="mt-3 space-y-0.5">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {formatCompactNumber(value)}
        </div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
      </div>
    </div>
  );
}

// ── My Group Card ──

function MyGroupCard({ group }: { group: MyGroupItem }) {
  const role = getRoleBadge(group.myRole);
  const RoleIcon = role.icon;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="group border-border hover:bg-muted/30 flex items-center gap-4 rounded-3xl border p-4 transition-all hover:shadow-sm"
    >
      <GroupAvatar name={group.name} avatarUrl={group.avatarUrl} className="h-14 w-14" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors">
          {group.name || "Nhóm không tên"}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {formatCompactNumber(group.memberCount)} thành viên
          </span>
          {group.unreadPostCount > 0 && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="font-medium text-primary">
                {group.unreadPostCount} bài mới
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", role.color)}>
          <RoleIcon size={12} />
          {role.label}
        </span>
        <ArrowRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}

// ── Search Group Card ──

function SearchGroupCard({ group }: { group: SearchGroupItem }) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="group border-border hover:bg-muted/30 flex items-center gap-4 rounded-3xl border p-4 transition-all hover:shadow-sm"
    >
      <GroupAvatar name={group.name} avatarUrl={group.avatarUrl} className="h-12 w-12" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {group.name || "Nhóm không tên"}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <PrivacyIcon privacy={group.privacy} />
          <span>{getPrivacyLabel(group.privacy)}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span>{formatCompactNumber(group.memberCount)} thành viên</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {group.isMember ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <UserCheck size={12} />
            Đã tham gia
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
            Xem nhóm
          </span>
        )}
      </div>
    </Link>
  );
}

// ── Skeleton ──

function GroupCardSkeleton() {
  return (
    <div className="border-border flex items-center gap-4 rounded-3xl border p-4 animate-pulse">
      <div className="h-14 w-14 rounded-2xl bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-3 w-28 rounded bg-muted" />
      </div>
      <div className="h-7 w-20 rounded-full bg-muted" />
    </div>
  );
}

// ── Main Page ──

export default function GroupsPage() {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 350);

  // ── Fetch my groups ──
  const {
    data: myGroupsData,
    isLoading: isMyGroupsLoading,
  } = useQuery({
    queryKey: ["my-groups"],
    queryFn: () => getMyGroups(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const myGroups: MyGroupItem[] = myGroupsData?.items ?? [];

  // ── Fetch search results ──
  const {
    data: searchData,
    isLoading: isSearching,
  } = useQuery({
    queryKey: ["groups-search", debouncedKeyword],
    queryFn: () => searchGroups({ keyword: debouncedKeyword, pageSize: 12 }),
    enabled: debouncedKeyword.trim().length >= 2,
    staleTime: 60 * 1000,
  });

  const searchResults: SearchGroupItem[] = searchData?.items ?? [];

  // ── Stats ──
  const adminGroups = myGroups.filter((g) => g.myRole === 2).length;
  const totalGroups = myGroups.length;

  if (!user) {
    return (
      <div className="mt-14.5 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="border-border bg-card max-w-md rounded-3xl border p-8 text-center shadow-sm">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
            <Users size={26} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Nhóm cộng đồng</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Đăng nhập để xem nhóm của bạn, tham gia các cộng đồng mới và tạo
            nhóm riêng.
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

        {/* ── Hero Header ── */}
        <section className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Users size={14} />
                Groups Hub
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Nhóm cộng đồng của bạn
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Quản lý nhóm hiện tại, khám phá cộng đồng mới hoặc tạo nhóm
                riêng để kết nối mọi người trên Kpett.
              </p>
            </div>

            <Button asChild className="rounded-full px-6 gap-2 shadow-sm">
              <Link href="/groups/create">
                <Plus size={18} />
                Tạo nhóm mới
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              icon={<Users size={20} />}
              label="Tổng nhóm"
              value={totalGroups}
              accent="bg-primary/10 text-primary"
            />
            <StatCard
              icon={<Crown size={20} />}
              label="Nhóm quản trị"
              value={adminGroups}
              accent="bg-amber-100 text-amber-600"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Bài mới"
              value={myGroups.reduce((sum, g) => sum + g.unreadPostCount, 0)}
              accent="bg-emerald-100 text-emerald-600"
            />
          </div>
        </section>

        {/* ── Content Grid ── */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">

          {/* ── Left Column: My Groups ── */}
          <div className="space-y-6">
            <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Nhóm của tôi
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tất cả nhóm mà bạn đang tham gia hoặc quản trị.
                  </p>
                </div>
                <div className="relative w-full lg:max-w-sm">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm nhóm..."
                    className="h-11 rounded-full pl-10 pr-4"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {isMyGroupsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <GroupCardSkeleton key={i} />
                  ))
                ) : myGroups.length === 0 ? (
                  <div className="border-border bg-muted/20 rounded-3xl border border-dashed px-5 py-10 text-center">
                    <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                      <Users size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Bạn chưa tham gia nhóm nào
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                      Hãy khám phá các cộng đồng bên phải hoặc tạo nhóm mới để
                      bắt đầu kết nối.
                    </p>
                    <Button asChild className="mt-4 rounded-full px-6 gap-2">
                      <Link href="/groups/create">
                        <Plus size={16} />
                        Tạo nhóm đầu tiên
                      </Link>
                    </Button>
                  </div>
                ) : (
                  myGroups.map((group) => (
                    <MyGroupCard key={group.id} group={group} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column: Search / Discover ── */}
          <div className="space-y-6">
            {/* Quick Create Card */}
            <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-foreground">
                    Tạo nhóm Kpett
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Xây dựng cộng đồng của riêng bạn, mời bạn bè và chia sẻ
                    nội dung cùng nhau.
                  </p>
                  <Button asChild variant="outline" className="mt-3 rounded-full px-5 gap-2" size="sm">
                    <Link href="/groups/create">
                      <Plus size={14} />
                      Bắt đầu tạo
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Search / Discover Section */}
            <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Khám phá nhóm
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tìm kiếm và tham gia cộng đồng trên toàn hệ thống.
                  </p>
                </div>
                {debouncedKeyword.trim().length >= 2 && (
                  <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground shrink-0">
                    Từ khóa: {debouncedKeyword}
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {debouncedKeyword.trim().length < 2 ? (
                  <div className="border-border bg-muted/20 rounded-3xl border border-dashed px-5 py-8 text-center">
                    <div className="bg-primary/10 text-primary mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
                      <Search size={20} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Nhập ít nhất 2 ký tự ở ô tìm kiếm phía trên để tìm nhóm
                      trên toàn hệ thống.
                    </p>
                  </div>
                ) : isSearching ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <GroupCardSkeleton key={i} />
                  ))
                ) : searchResults.length === 0 ? (
                  <div className="border-border bg-muted/20 rounded-3xl border border-dashed px-5 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Không tìm thấy nhóm phù hợp với từ khóa &quot;{debouncedKeyword}&quot;.
                    </p>
                  </div>
                ) : (
                  searchResults.map((group) => (
                    <SearchGroupCard key={group.id} group={group} />
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}