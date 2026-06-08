"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearchUsersInfinite } from "@/hooks/user/use-search-users";
import { useInView } from "react-intersection-observer";
import { UserAvatar } from "@/components/user/user-avatar";
import { Loader2, Search, Users, FileText, UserSquare2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    const [localQuery, setLocalQuery] = useState(query);
    const [activeTab, setActiveTab] = useState("users");

    const {
        users,
        isLoading,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage
    } = useSearchUsersInfinite(query, 20);

    const { ref, inView } = useInView();

    useEffect(() => {
        setLocalQuery(query);
    }, [query]);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (localQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`);
        }
    };

    // Component hiển thị Loading mượt mà
    const SearchSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-2xl border border-border bg-card flex items-center gap-4 animate-pulse">
                    <div className="w-14 h-14 rounded-full bg-muted shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="w-24 h-9 bg-muted rounded-full shrink-0"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-4xl mt-14.5 mx-auto p-4 md:p-6 w-full min-h-screen flex flex-col">
            {/* HEADER TÌM KIẾM */}
            <div className="mb-6 space-y-6">
                <form onSubmit={handleSearch} className="relative w-full shadow-sm rounded-full">
                    <Input
                        type="text"
                        placeholder="Tìm kiếm bạn bè, bài viết..."
                        value={localQuery}
                        onChange={(e) => setLocalQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-6 text-lg rounded-full bg-card border-border focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={22} />
                    <Button
                        type="submit"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
                        disabled={!localQuery.trim()}
                    >
                        Tìm
                    </Button>
                </form>

                {query && (
                    <h1 className="text-xl font-bold px-1">
                        Kết quả cho: <span className="text-primary break-all">&quot;{query}&quot;</span>
                    </h1>
                )}
            </div>

            {/* CHƯA NHẬP TỪ KHÓA */}
            {!query ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-10 border border-dashed border-border rounded-3xl bg-card/50">
                    <div className="w-20 h-20 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-6">
                        <Search size={36} />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Bắt đầu tìm kiếm</h2>
                    <p className="text-muted-foreground max-w-md">
                        Nhập tên, username hoặc từ khóa bất kỳ để khám phá cộng đồng và các bài viết thú vị trên hệ thống.
                    </p>
                </div>
            ) : (
                <>
                    {/* TABS NAVEGATION */}
                    <div className="flex items-center gap-6 border-b border-border/60 mb-6 overflow-x-auto custom-scrollbar">
                        <button
                            onClick={() => setActiveTab("users")}
                            className={cn(
                                "flex items-center gap-2 pb-3 px-2 text-sm font-semibold transition-all relative whitespace-nowrap",
                                activeTab === "users" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Users size={18} />
                            Mọi người
                            {activeTab === "users" && (
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("posts")}
                            className={cn(
                                "flex items-center gap-2 pb-3 px-2 text-sm font-semibold transition-all relative whitespace-nowrap",
                                activeTab === "posts" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <FileText size={18} />
                            Bài viết
                            {activeTab === "posts" && (
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></span>
                            )}
                        </button>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1">
                        {activeTab === "users" && (
                            <>
                                {isLoading ? (
                                    <SearchSkeleton />
                                ) : users.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-3xl">
                                        <UserSquare2 size={48} className="text-muted-foreground/50 mb-4" />
                                        <p className="text-lg font-semibold">Không tìm thấy ai</p>
                                        <p className="text-muted-foreground text-sm mt-1">
                                            Thử dùng các từ khóa khác xem sao.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {users.map((u) => (
                                            <div
                                                key={u.id}
                                                className="group flex items-center justify-between p-4 bg-card hover:bg-muted/30 border border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <Link href={`/${u.username}`} className="shrink-0 relative">
                                                        <UserAvatar user={{ ...u, avatarUrl: u.avatarUrl }} className="w-14 h-14" />
                                                    </Link>
                                                    <div className="flex flex-col min-w-0">
                                                        <Link href={`/${u.username}`} className="font-bold text-[15px] truncate">
                                                            {u.displayName}
                                                        </Link>
                                                        <span className="text-sm text-muted-foreground truncate">@{u.username}</span>
                                                    </div>
                                                </div>

                                                <Link href={`/${u.username}`} className="shrink-0 ml-2">
                                                    <Button variant="secondary" size="sm" className="rounded-full px-5 font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                        Hồ sơ
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Neo Scroll Infinite */}
                                {hasNextPage && (
                                    <div ref={ref} className="p-8 flex justify-center">
                                        {isFetchingNextPage ? (
                                            <Loader2 className="animate-spin text-primary" size={28} />
                                        ) : (
                                            <span className="text-sm text-muted-foreground font-medium">Cuộn để xem thêm...</span>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === "posts" && (
                            <div className="flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-3xl">
                                <FileText size={48} className="text-muted-foreground/50 mb-4" />
                                <p className="text-lg font-semibold">Tính năng đang phát triển</p>
                                <p className="text-muted-foreground text-sm mt-1">
                                    Tìm kiếm bài viết sẽ sớm được ra mắt.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
