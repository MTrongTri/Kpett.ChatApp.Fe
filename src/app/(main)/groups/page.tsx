"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Globe2,
  Lock,
  Users,
  Plus,
  Search,
  Crown,
  Shield,
  UserCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Hash,
  ChevronRight,
  Compass,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { cn } from "@/lib/utils";
import { getMyGroups, searchGroups } from "@/services/group.service";
import type { MyGroupItem, SearchGroupItem } from "@/types/group";

// ── Cover gradient palette ──

const COVER_GRADIENTS = [
  "from-violet-600 via-purple-600 to-fuchsia-600",
  "from-cyan-600 via-teal-600 to-emerald-600",
  "from-orange-600 via-rose-600 to-pink-600",
  "from-blue-600 via-indigo-600 to-violet-600",
  "from-emerald-600 via-teal-600 to-cyan-600",
  "from-pink-600 via-rose-600 to-orange-600",
  "from-indigo-600 via-blue-600 to-cyan-600",
  "from-amber-600 via-orange-600 to-rose-600",
  "from-teal-600 via-emerald-600 to-green-600",
  "from-fuchsia-600 via-pink-600 to-rose-600",
];

function getCoverGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return COVER_GRADIENTS[Math.abs(hash) % COVER_GRADIENTS.length];
}

// ── Helpers ──

function getPrivacyLabel(privacy: number | string) {
  if (privacy === 0 || privacy === "public") return "Công khai";
  if (privacy === 1 || privacy === "private") return "Riêng tư";
  return "Ẩn";
}

function getRoleBadge(role: number) {
  switch (role) {
    case 2:
      return { label: "Quản trị", icon: Crown, color: "text-amber-300 bg-amber-500/20 border-amber-500/30" };
    case 1:
      return { label: "Kiểm duyệt", icon: Shield, color: "text-blue-300 bg-blue-500/20 border-blue-500/30" };
    default:
      return { label: "Thành viên", icon: UserCheck, color: "text-slate-300 bg-slate-500/20 border-slate-500/30" };
  }
}

function GroupAvatar({ name, avatarUrl, className }: { name: string | null; avatarUrl: string | null; className?: string }) {
  if (avatarUrl) {
    return (
      <div className={cn("shrink-0 overflow-hidden rounded-xl ring-2 ring-white/20", className)}>
        <img src={avatarUrl} alt={name || "Group"} className="h-full w-full object-cover" />
      </div>
    );
  }

  const initial = (name || "G").charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold ring-2 ring-white/20",
        className,
      )}
    >
      <span className="text-lg">{initial}</span>
    </div>
  );
}

// ── Group Tile Card ──

function GroupTileCard({ group }: { group: MyGroupItem }) {
  const role = getRoleBadge(group.myRole);
  const RoleIcon = role.icon;
  const coverGradient = getCoverGradient(group.id);

  return (
    <Link
      href={`/groups/${group.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
    >
      <div className={cn("relative h-24 bg-gradient-to-br", coverGradient)}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-3 left-3">
          <GroupAvatar
            name={group.name}
            avatarUrl={group.avatarUrl}
            className="h-12 w-12 shadow-lg"
          />
        </div>
        <div className="absolute right-3 top-3">
          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold backdrop-blur-sm", role.color)}>
            <RoleIcon size={10} />
            {role.label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-4">
        <div>
          <p className="truncate text-[15px] font-bold text-foreground group-hover:text-purple-400 transition-colors">
            {group.name || "Nhóm không tên"}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {formatCompactNumber(group.memberCount)}
            </span>
            {group.unreadPostCount > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="font-semibold text-purple-400">
                  +{group.unreadPostCount}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <span className="text-[11px] text-muted-foreground/60">Mở nhóm</span>
          <ChevronRight size={14} className="text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-purple-400" />
        </div>
      </div>
    </Link>
  );
}

// ── Discover Group Card ──

function DiscoverGroupCard({ group }: { group: SearchGroupItem }) {
  const coverGradient = getCoverGradient(group.id);

  return (
    <Link
      href={`/groups/${group.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
    >
      <div className={cn("relative h-20 bg-gradient-to-br", coverGradient)}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -bottom-6 left-3">
          <GroupAvatar
            name={group.name}
            avatarUrl={group.avatarUrl}
            className="h-11 w-11 shadow-lg ring-2 ring-card"
          />
        </div>
        <div className="absolute right-2 top-2">
          {group.privacy === 0 ? (
            <Globe2 size={12} className="text-white/80" />
          ) : (
            <Lock size={12} className="text-white/80" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-8">
        <p className="truncate text-sm font-bold text-foreground group-hover:text-purple-400 transition-colors">
          {group.name || "Nhóm không tên"}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{getPrivacyLabel(group.privacy)}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>{formatCompactNumber(group.memberCount)}</span>
          </div>
          {group.isMember ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              <UserCheck size={10} />
              Đã tham gia
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-[11px] font-semibold text-purple-300">
              Khám phá
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ──

function GroupTileSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card animate-pulse">
      <div className="h-24 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

// ── Component để tạo pattern dots ──

function DotPattern() {
  return (
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />
  );
}

// ── Main Page ──

export default function GroupsPage() {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [filterRole, setFilterRole] = useState<number | null>(null);
  const debouncedKeyword = useDebounce(keyword, 350);

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

  const filteredGroups = useMemo(() => {
    if (filterRole === null) return myGroups;
    return myGroups.filter((g) => g.myRole === filterRole);
  }, [myGroups, filterRole]);

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

  const adminGroups = myGroups.filter((g) => g.myRole === 2).length;
  const totalGroups = myGroups.length;
  const totalUnread = myGroups.reduce((sum, g) => sum + g.unreadPostCount, 0);

  const roleFilters = [
    { label: "Tất cả", value: null },
    { label: "Quản trị", value: 2, icon: Crown },
    { label: "Thành viên", value: 0, icon: UserCheck },
  ];

  if (!user) {
    return (
      <div className="mt-14.5 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-8 text-center shadow-2xl max-w-md">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
            <Users size={26} className="text-white" />
          </div>
          <h1 className="relative text-2xl font-bold text-white">Nhóm cộng đồng</h1>
          <p className="relative mt-3 text-sm leading-relaxed text-slate-400">
            Đăng nhập để khám phá và tham gia các cộng đồng trên Kpett.
          </p>
          <div className="relative mt-6 flex justify-center">
            <Button asChild className="rounded-full px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-purple-500/25">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14.5 min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 p-6 shadow-2xl md:p-8">
          <DotPattern />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 backdrop-blur-sm">
                <Hash size={12} />
                Kpett Groups
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                Cộng đồng{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Kpett
                </span>
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-400 md:text-base">
                Nơi hội tụ những nhóm cộng đồng sôi động. Tham gia, kết nối và
                chia sẻ cùng những người có chung sở thích.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button asChild
                variant="outline"
                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
              >
                <Link href="/groups/invitations">
                  <Sparkles size={16} />
                  Lời mời
                </Link>
              </Button>
              <Button asChild className="rounded-full border-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500">
                <Link href="/groups/create">
                  <Plus size={18} />
                  Tạo nhóm
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats inline */}
          <div className="relative mt-6 grid grid-cols-3 gap-3 md:gap-4">
            {[
              { icon: Users, label: "Tổng nhóm", value: totalGroups, desc: "Nhóm đang tham gia" },
              { icon: Crown, label: "Quản trị", value: adminGroups, desc: "Nhóm bạn làm admin" },
              { icon: TrendingUp, label: "Bài mới", value: totalUnread, desc: "Chưa đọc" },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/[0.07]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300">
                  <stat.icon size={18} />
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-white">
                    {formatCompactNumber(stat.value)}
                  </div>
                  <div className="text-sm font-semibold text-slate-300">{stat.label}</div>
                  <div className="text-xs text-slate-500">{stat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Content ── */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">

          {/* ── Group Grid ── */}
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Nhóm của tôi
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredGroups.length} nhóm &middot; tất cả nhóm bạn tham gia
                </p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm nhóm..."
                  className="h-10 rounded-xl border-white/10 bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Role filter */}
            <div className="flex items-center gap-2">
              {roleFilters.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.label}
                    onClick={() => setFilterRole(f.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                      filterRole === f.value
                        ? "border-purple-500/50 bg-purple-500/20 text-purple-300 shadow-sm shadow-purple-500/10"
                        : "border-white/10 bg-card text-muted-foreground hover:border-white/20 hover:text-foreground",
                    )}
                  >
                    {Icon && <Icon size={12} />}
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Group tiles */}
            {isMyGroupsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <GroupTileSkeleton key={i} />
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-purple-950/50 px-6 py-12 text-center">
                <DotPattern />
                <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
                  <Users size={24} className="text-white" />
                </div>
                <h3 className="relative text-lg font-bold text-white">
                  {filterRole !== null
                    ? "Không có nhóm nào với vai trò này"
                    : "Bạn chưa tham gia nhóm nào"}
                </h3>
                <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                  Khám phá các cộng đồng bên cạnh hoặc tạo nhóm mới để bắt đầu.
                </p>
                <Button asChild className="relative mt-5 rounded-full border-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-indigo-500">
                  <Link href="/groups/create">
                    <Plus size={16} />
                    Tạo nhóm đầu tiên
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredGroups.map((group) => (
                  <GroupTileCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">
            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/10 bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Bắt đầu nhanh
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Tạo nhóm hoặc xem lời mời
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/25">
                  <Sparkles size={16} className="text-white" />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Link
                  href="/groups/create"
                  className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 transition-all hover:border-purple-500/30 hover:bg-purple-500/5 hover:shadow-sm hover:shadow-purple-500/5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                    <Plus size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      Tạo nhóm mới
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Xây dựng cộng đồng của bạn
                    </p>
                  </div>
                  <ArrowRight size={14} className="shrink-0 text-muted-foreground/40" />
                </Link>

                <Link
                  href="/groups/invitations"
                  className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 transition-all hover:border-purple-500/30 hover:bg-purple-500/5 hover:shadow-sm hover:shadow-purple-500/5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      Lời mời tham gia
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Xem và phản hồi lời mời
                    </p>
                  </div>
                  <ArrowRight size={14} className="shrink-0 text-muted-foreground/40" />
                </Link>
              </div>
            </div>

            {/* Discover */}
            <div className="rounded-2xl border border-white/10 bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Khám phá
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Tìm cộng đồng mới
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                  <Compass size={16} className="text-white" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {debouncedKeyword.trim().length < 2 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                      <Search size={18} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nhập từ khóa ở ô tìm kiếm phía trên để tìm nhóm mới.
                    </p>
                  </div>
                ) : isSearching ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      Không tìm thấy nhóm với từ khóa &quot;{debouncedKeyword}&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((group) => (
                      <DiscoverGroupCard key={group.id} group={group} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
