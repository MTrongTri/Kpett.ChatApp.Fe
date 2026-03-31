"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  // Thêm phím tắt Cmd+K hoặc Ctrl+K để focus nhanh
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div
      className={cn(
        "mx-4 hidden w-55 items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-200 lg:flex",
        "border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900",
        "focus-within:border-primary/50 focus-within:ring-primary/10 focus-within:ring-2",
        "focus-within:w-70",
      )}
    >
      <Search size={14} className="shrink-0 text-zinc-500" />

      <Input
        ref={inputRef}
        type="text"
        placeholder="Tìm kiếm..."
        className="h-auto w-full border-none bg-transparent p-0 text-[12px] text-zinc-900 shadow-none outline-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-zinc-200 dark:placeholder:text-zinc-600"
      />
    </div>
  );
}
