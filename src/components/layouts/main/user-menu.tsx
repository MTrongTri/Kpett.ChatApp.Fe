"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";
import { Bookmark, LogOut, Settings, TrendingUp, User } from "lucide-react";

export default function UserMenu() {
  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button
          className="
            h-[34px] w-[34px] rounded-md ml-1.5 flex-shrink-0
            bg-gradient-to-br from-indigo-500 to-purple-600
            flex items-center justify-center
            font-bold text-[13px] text-white
            border border-zinc-700
            transition-all duration-200
            hover:shadow-[0_0_10px_rgba(99,102,241,0.4)]
            cursor-pointer outline-none
          "
        >
          T
        </button>
      </HoverCardTrigger>

      {/* Content: Phần Menu đổ xuống */}
      <HoverCardContent
        align="end"
        sideOffset={8}
        className="
          w-52 bg-zinc-900 border-zinc-700
          text-zinc-200 rounded-lg shadow-xl shadow-black/40
          p-1.5 p-0 overflow-hidden
        "
      >
        {/* Header/Label */}
        <div className="px-3 py-3 border-b border-zinc-800 bg-zinc-900/50">
          <p className="font-semibold text-sm text-zinc-100 leading-none">tuan.dev</p>
          <p className="text-[11px] text-zinc-500 font-normal mt-1.5">Tuấn Nguyễn · Backend</p>
        </div>

        {/* Menu Items Group */}
        <div className="p-1">
          <MenuItem icon={<User size={13} />} label="Trang cá nhân" />
          <MenuItem icon={<Bookmark size={13} />} label="Đã lưu" />
          <MenuItem icon={<TrendingUp size={13} />} label="Thống kê" />
          <MenuItem icon={<Settings size={13} />} label="Cài đặt" />
        </div>

        {/* Separator */}
        <div className="h-[1px] bg-zinc-800 mx-1" />

        {/* Logout Item */}
        <div className="p-1">
          <button className="
            w-full flex items-center gap-2 px-2.5 py-2 rounded-md
            text-xs tracking-wide text-red-400
            hover:bg-red-400/10 hover:text-red-300
            transition-colors duration-150 cursor-pointer
          ">
            <LogOut size={13} />
            Đăng xuất
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="
      w-full flex items-center gap-2 px-2.5 py-2 rounded-md
      text-xs tracking-wide text-zinc-300
      hover:bg-zinc-800 hover:text-primary
      transition-colors duration-150 cursor-pointer
    ">
      {icon}
      {label}
    </button>
  );
}