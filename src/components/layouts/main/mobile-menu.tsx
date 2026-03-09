import { Menu, Plus, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_TABS } from "./nav-tab";

export default function MobileMenu() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="
            md:hidden h-9 w-9 rounded-md
            bg-zinc-900 border-zinc-700 text-zinc-400
            hover:bg-zinc-800 hover:text-zinc-100
          "
        >
          <Menu size={16} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-64 bg-zinc-950 border-zinc-800 p-0"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu điều hướng</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          {/* Mobile logo */}
          <div className="px-6 py-5 border-b border-zinc-800">
            <span
              className="font-serif italic font-black text-2xl tracking-tighter text-primary"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              VŌ<span className="not-italic font-light text-zinc-100">ID</span>
            </span>
          </div>

          {/* Mobile search */}
          <div className="px-4 pt-4">
            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2">
              <Search size={13} className="text-zinc-500" />
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                className="
                  bg-transparent border-none shadow-none p-0 h-auto
                  text-[12px] text-zinc-200 placeholder:text-zinc-600
                  focus-visible:ring-0 focus-visible:ring-offset-0
                "
              />
            </div>
          </div>

          {/* Mobile nav items */}
          <nav className="flex flex-col gap-0.5 px-3 pt-4">
            {NAV_TABS.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "text-[11px] font-medium tracking-widest uppercase",
                    "transition-colors duration-150",
                    active
                      ? "text-primary bg-amber-400/10"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile compose */}
          <div className="px-4 pt-4">
            <Button
              className="
              w-full bg-amber-400 text-zinc-900 text-[11px]
              font-semibold tracking-wider uppercase h-10 rounded-lg
              hover:bg-amber-300 gap-2
            "
            >
              <Plus size={14} strokeWidth={2.5} />
              Tạo bài mới
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
