'use client'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";
import { Bookmark, LogOut, Settings, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserMenu() {
  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button
          className="
            h-8 w-8 rounded-full ml-1.5 flex-shrink-0
            bg-gradient-to-br from-indigo-500 to-purple-600
            flex items-center justify-center
            font-bold text-[12px] text-white
            border border-zinc-200 dark:border-zinc-800
            transition-all duration-300
            hover:scale-105 hover:shadow-[0_0_12px_rgba(99,102,241,0.4)]
            cursor-pointer outline-none
          "
        >
          T
        </button>
      </HoverCardTrigger>

      <HoverCardContent
        align="end"
        sideOffset={10}
        className="
          w-56 p-0 overflow-hidden
          bg-white dark:bg-zinc-950 
          border-zinc-200 dark:border-zinc-800
          shadow-2xl shadow-black/10 dark:shadow-black/60
          rounded-xl animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* User Info Header */}
        <div className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex flex-col">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
              tuan.dev
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-1.5">
              Tuấn Nguyễn · <span className="text-primary/80">Backend</span>
            </p>
          </div>
        </div>

        {/* Menu Items Group */}
        <div className="p-1.5 space-y-0.5">
          <MenuItem icon={<User size={14} />} label="Trang cá nhân" />
          <MenuItem icon={<Bookmark size={14} />} label="Đã lưu trữ" />
          <MenuItem icon={<TrendingUp size={14} />} label="Thống kê" />
          <MenuItem icon={<Settings size={14} />} label="Cài đặt hệ thống" />
        </div>

        {/* Logout Section */}
        <div className="p-1.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
          <button className="
            w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg
            text-[12px] font-semibold text-red-500 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-500/10 
            transition-all duration-200 cursor-pointer
          ">
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
    <button className="
      w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg
      text-[12px] font-medium text-zinc-600 dark:text-zinc-400
      hover:bg-zinc-100 dark:hover:bg-zinc-800 
      hover:text-zinc-900 dark:hover:text-zinc-100
      transition-all duration-200 cursor-pointer
    ">
      <span className="opacity-80">{icon}</span>
      {label}
    </button>
  );
}