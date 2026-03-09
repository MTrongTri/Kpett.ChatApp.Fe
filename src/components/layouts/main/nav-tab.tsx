import { cn } from "@/lib/utils";
import { Bookmark, CalendarDays, Clapperboard, Compass, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavTab {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const NAV_TABS: NavTab[] = [
  { label: "Feed",      href: "/",        icon: <Home size={14} /> },
  { label: "Khám phá",  href: "/explore", icon: <Compass size={14} /> },
  { label: "Reels",     href: "/reels",   icon: <Clapperboard size={14} /> },
  { label: "Sự kiện",   href: "/events",  icon: <CalendarDays size={14} /> },
  { label: "Lưu trữ",   href: "/saved",   icon: <Bookmark size={14} /> },
];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-0.5 flex-1">
      {NAV_TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-md",
              "text-[11px] font-medium tracking-widest uppercase",
              "transition-colors duration-150 whitespace-nowrap",
              active
                ? "text-primary bg-primary/10"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
            )}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}