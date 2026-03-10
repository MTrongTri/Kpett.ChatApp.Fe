'use client'

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
    <div className={cn(
      "hidden lg:flex items-center gap-2 px-3 py-1.5 mx-4 w-[220px] rounded-lg transition-all duration-200",
      "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800",
      "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10",
      "focus-within:w-[280px]" // Hiệu ứng giãn rộng khi click vào
    )}>
      <Search size={14} className="text-zinc-500 flex-shrink-0" />
      
      <Input
        ref={inputRef}
        type="text"
        placeholder="Tìm kiếm..."
        className="
          bg-transparent border-none shadow-none outline-none p-0 h-auto
          text-[12px] text-zinc-900 dark:text-zinc-200 
          placeholder:text-zinc-500 dark:placeholder:text-zinc-600
          focus-visible:ring-0 focus-visible:ring-offset-0
          w-full
        "
      />
    </div>
  );
}