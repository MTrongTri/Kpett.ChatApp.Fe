"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useSignalR } from "@/components/providers/signalr-provider";
import { UserAvatar } from "@/components/user/user-avatar";
import authService from "@/services/auth.service";
import { RootState } from "@/store/store";
import { Bookmark, LogOut, Monitor, Moon, Settings, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";

export default function UserMenu() {
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const { logout } = useAuth();
  const { connection, isConnected } = useSignalR();

  const queryClient = useQueryClient();

  // Theme state
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Tránh lỗi Hydration mismatch bằng cách chỉ render UI theme sau khi component đã mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout(accessToken!);
      logout();

      if (connection && isConnected) {
        await connection.stop();
      }

      queryClient.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


  if (!user) {
    return null;
  }

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button className="flex items-center appearance-none border-none bg-transparent p-0 outline-none">
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
              {user.displayName}
            </p>
            <p className="mt-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              @{user.username}
            </p>
          </div>
        </div>

        {/* Menu Items Group */}
        <div className="space-y-0.5 p-1.5">
          <Link href={`/${user.username}`}>
            <MenuItem icon={<User size={14} />} label="Trang cá nhân" />
          </Link>
          <Link href={`/${user.username}?tabType=saved`}>
            <MenuItem icon={<Bookmark size={14} />} label="Đã lưu trữ" />
          </Link>
          <Link href={`/${user.username}/info`}>
            <MenuItem icon={<Settings size={14} />} label="Cài đặt hệ thống" />
          </Link>
        </div>

        {/* Theme Toggle Section */}
        <div className="border-t border-zinc-100 p-1.5 dark:border-zinc-800">
          <div className="flex w-full items-center justify-between px-3 py-1.5">
            <span className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400">
              Giao diện
            </span>

            {/* Cụm 3 nút chọn Theme */}
            <div className="flex items-center gap-1 rounded-lg bg-zinc-100/80 p-1 dark:bg-zinc-900/50">
              <button
                onClick={() => setTheme("light")}
                title="Sáng"
                className={`flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-all duration-200 ${mounted && theme === "light"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
              >
                <Sun size={14} />
              </button>

              <button
                onClick={() => setTheme("dark")}
                title="Tối"
                className={`flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-all duration-200 ${mounted && theme === "dark"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
              >
                <Moon size={14} />
              </button>

              <button
                onClick={() => setTheme("system")}
                title="Hệ thống"
                className={`flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-all duration-200 ${mounted && theme === "system"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }`}
              >
                <Monitor size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="border-t border-zinc-100 bg-zinc-50/30 p-1.5 dark:border-zinc-800 dark:bg-zinc-900/10">
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-semibold text-red-500 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
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
    <div className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-medium text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
      <span className="opacity-80">{icon}</span>
      {label}
    </div>
  );
}