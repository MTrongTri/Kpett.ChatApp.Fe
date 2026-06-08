"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2, X, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchUsersPreview } from "@/hooks/user/use-search-users";
import { UserAvatar } from "@/components/user/user-avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SearchBar() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedKeyword = useDebounce(keyword, 500);

  const { data, isLoading, isFetching } = useSearchUsersPreview(debouncedKeyword, 5);
  const previewUsers = data?.items || [];

  const isTyping = keyword !== debouncedKeyword;
  const showLoader = isTyping || isLoading || isFetching;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!isMobileExpanded && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileExpanded]);

  useEffect(() => {
    if (isMobileExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileExpanded]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keyword.trim()) {
      submitSearch();
    }
  };

  const submitSearch = () => {
    if (keyword.trim()) {
      setIsFocused(false);
      setIsMobileExpanded(false);
      router.push(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const clearSearch = () => {
    setKeyword("");
    inputRef.current?.focus();
  };

  const openMobileSearch = () => {
    setIsMobileExpanded(true);
    setIsFocused(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const closeMobileSearch = () => {
    setIsMobileExpanded(false);
    setIsFocused(false);
    setKeyword("");
  };

  const showPopup = (isFocused || isMobileExpanded) && keyword.trim().length > 0;

  return (
    <>
      {/* 1. NÚT KÍNH LÚP TRÊN MOBILE */}
      <div className="md:hidden flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground"
          onClick={openMobileSearch}
        >
          <Search size={22} />
        </Button>
      </div>

      {/* 2. KHUNG TÌM KIẾM CHÍNH */}
      <div
        ref={wrapperRef}
        className={cn(
          "transition-all duration-200 ease-in-out",
          isMobileExpanded
            ? "fixed inset-0 z-[99999] bg-background block animate-in slide-in-from-bottom-2 fade-in-90"
            : "hidden md:block relative w-full max-w-[240px] sm:max-w-[300px] lg:max-w-[400px]"
        )}
      >
        <div className={cn("relative flex items-center gap-2", isMobileExpanded ? "h-[64px] p-3 border-b border-border shadow-sm" : "")}>
          {isMobileExpanded && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
              onClick={closeMobileSearch}
            >
              <ArrowLeft size={22} className="text-foreground" />
            </Button>
          )}

          <div className="relative flex-1 flex items-center h-full">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm mọi người..."
              className={cn(
                "pl-10 pr-9 rounded-full bg-muted/50 border-transparent transition-all w-full border-none",
                "focus-visible:ring-1 focus-visible:bg-background focus-visible:ring-primary",
                isMobileExpanded ? "h-11 text-base shadow-inner" : "h-10 text-sm"
              )}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
            />
            <Search
              size={18}
              className="absolute left-3.5 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={submitSearch}
            />

            {keyword && (
              <X
                size={16}
                className="absolute right-3.5 text-muted-foreground hover:text-foreground cursor-pointer bg-muted rounded-full p-0.5"
                onClick={clearSearch}
              />
            )}
          </div>
        </div>

        {/* 3. POPUP KẾT QUẢ */}
        {showPopup && (
          <div
            className={cn(
              "bg-card flex flex-col",
              isMobileExpanded
                ? "w-full h-[calc(100vh-64px)] overflow-y-auto pb-32"
                : "absolute top-[calc(100%+8px)] left-0 w-full border border-border rounded-xl shadow-xl z-[100] max-h-[400px] overflow-y-auto custom-scrollbar"
            )}
          >
            {showLoader ? (
              <div className="flex justify-center p-6 text-primary">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : previewUsers.length > 0 ? (
              <div className="flex flex-col">
                {previewUsers.map((u) => (
                  <Link
                    href={`/${u.username}`}
                    key={u.id}
                    onClick={() => {
                      setIsFocused(false);
                      setIsMobileExpanded(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 hover:bg-muted transition-colors",
                      isMobileExpanded ? "p-4 border-b border-border/50" : "p-3"
                    )}
                  >
                    <UserAvatar user={{ ...u, avatarUrl: u.avatarUrl }} className="w-10 h-10 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">{u.displayName}</span>
                      <span className="text-xs text-muted-foreground truncate">@{u.username}</span>
                    </div>
                  </Link>
                ))}

                <div
                  onClick={submitSearch}
                  className={cn(
                    "text-center text-primary font-medium hover:bg-primary/10 cursor-pointer transition-colors",
                    isMobileExpanded ? "p-5 text-base" : "p-3 text-sm border-t border-border"
                  )}
                >
                  Xem tất cả kết quả cho &quot;{keyword}&quot;
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Không tìm thấy ai với từ khóa &quot;{keyword}&quot;.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
