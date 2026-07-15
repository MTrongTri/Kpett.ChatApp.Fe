"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_TABS } from "./nav-tab";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around h-14 bg-background/80 backdrop-blur-xl border-t border-border safe-area-pb">
      {NAV_TABS.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0",
              "transition-colors duration-200",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className={cn(
              "transition-transform duration-200",
              active && "scale-110"
            )}>
              {tab.icon}
            </span>
            <span className="text-[9px] font-semibold tracking-wide truncate max-w-full px-0.5">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
