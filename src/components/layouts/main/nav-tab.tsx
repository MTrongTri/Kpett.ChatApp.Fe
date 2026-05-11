'use client'

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Clapperboard,
  CalendarDays,
  Bookmark,
  Users
} from "lucide-react";

// Tách interface để có thể tái sử dụng ở MobileMenu
export interface NavTabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const NAV_TABS: NavTabItem[] = [
  { label: "Feed", href: "/", icon: <Home size={14} /> },
  { label: "Bạn bè", href: "/friends", icon: <Users size={14} /> },
  // { label: "Khám phá",  href: "/explore", icon: <Compass size={14} /> },
  { label: "Reels", href: "/reels", icon: <Clapperboard size={14} /> },
  // { label: "Sự kiện",   href: "/events",  icon: <CalendarDays size={14} /> },
  { label: "Lưu trữ", href: "/saved", icon: <Bookmark size={14} /> },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-1 flex-1 px-4">
      {NAV_TABS.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "text-sm font-semibold",
              "transition-all duration-200 whitespace-nowrap",
              active
                ? "text-primary bg-primary/10 dark:bg-primary/20"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            {/* Thêm hiệu ứng cho icon khi active */}
            <span className={cn(
              "transition-transform duration-200",
              active && "scale-110"
            )}>
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}