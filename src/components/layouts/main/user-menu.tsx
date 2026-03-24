"use client";

import { Bookmark, LogOut, Settings, TrendingUp, User } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserAvatar } from "@/components/user/user-avatar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function UserMenu() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button className="cursor-pointer appearance-none border-none bg-transparent p-0 outline-none">
          <UserAvatar user={user} />
        </button>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        sideOffset={10}
        className="animate-in fade-in zoom-in-95 w-56 overflow-hidden rounded-xl border-zinc-200 bg-white p-0 shadow-2xl shadow-black/10 duration-200 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/60"
      >
        {/* User Info Header */}
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="flex flex-col">
            <p className="text-sm leading-none font-bold text-zinc-900 dark:text-zinc-100">
              {user.username}
            </p>
            <p className="mt-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {user.displayName} ·{" "}
              <span className="text-primary/80">Backend</span>
            </p>
          </div>
        </div>

        {/* Menu Items Group */}
        <div className="space-y-0.5 p-1.5">
          <Link href={user.username}>
            <MenuItem icon={<User size={14} />} label="Trang cá nhân" />
          </Link>
          <Link href={`${user.username}?tabType=saved`}>
            <MenuItem icon={<Bookmark size={14} />} label="Đã lưu trữ" />
          </Link>
          <Link href={`${user.username}/info`}>
            <MenuItem icon={<Settings size={14} />} label="Cài đặt hệ thống" />
          </Link>
        </div>

        {/* Logout Section */}
        <div className="border-t border-zinc-100 bg-zinc-50/30 p-1.5 dark:border-zinc-800 dark:bg-zinc-900/10">
          <button className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-semibold text-red-500 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
            <LogOut size={14} />
            Đăng xuất
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

// Tách Component con để tái sử dụng
function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
      <span className="opacity-80">{icon}</span>
      {label}
    </button>
  );
}
