'use client'

import { useState, useEffect } from "react";
import { Menu, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";
import { Button } from "../../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NAV_TABS } from "./nav-tab";
import Logo from "./logo";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import PostModal from "@/components/posts/post-editor/post-editor";

export default function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { user: currentUser } = useSelector((state: RootState) => state.auth);


  const [isOpen, setIsOpen] = useState(false);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setMode("create");
    setSelectedPostId(null)
    setIsOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="
            md:hidden h-9 w-9 rounded-md
            bg-background border-border
            text-muted-foreground
            hover:bg-muted
          "
        >
          <Menu size={16} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-72 bg-background border-border p-0 flex flex-col"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Menu điều hướng</SheetTitle>
        </SheetHeader>

        {/* Header của Menu: Sử dụng lại component Logo */}
        <div className="px-6 py-5 border-b border-border">
          <Logo />
        </div>

        {/* Danh sách điều hướng */}
        <nav className="flex-1 px-3 pt-4 space-y-1">
          {NAV_TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl",
                  "text-[12px] font-semibold tracking-wider uppercase transition-all",
                  active
                    ? "text-primary bg-primary/10 dark:bg-amber-400/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {/* Clone icon để tùy chỉnh size nếu cần */}
                <span className={cn(active ? "text-primary" : "text-muted-foreground")}>
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            );
          })}
        </nav>


        <div className="p-4 border-t border-border">
          {currentUser ? (
            <Button
              onClick={handleOpenCreate}
              className="
        w-full bg-primary text-primary-foreground 
        text-[12px] font-bold tracking-widest uppercase h-12 rounded-xl
        hover:opacity-90 transition-opacity gap-2
      "
            >
              <Plus size={16} strokeWidth={3} />
              Tạo bài mới
              <PostModal open={isOpen} onOpenChange={setIsOpen} mode={mode} postId={selectedPostId} />
            </Button>
          ) : (
            <Link
              href="/login"
              className="
        flex items-center justify-center w-full bg-primary text-primary-foreground 
        text-[12px] font-bold tracking-widest uppercase h-12 rounded-xl
        hover:opacity-90 transition-opacity gap-2
      "
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
