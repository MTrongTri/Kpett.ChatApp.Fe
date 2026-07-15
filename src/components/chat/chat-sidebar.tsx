"use client";

import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MoreHorizontal, Search, Loader2, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ConversationAvatar } from './conversation-avatar';
import { useAuth } from '../providers/auth-provider';
import { useConversations } from '@/hooks/chat/use-conversations';
import { useInView } from 'react-intersection-observer';
import { CreateGroupModal } from './create-group-modal';
import { formatSystemMessage } from '@/lib/message-utils';
import { shouldShowDotOnline } from '@/lib/conversation-utils';

export default function ChatSidebar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const activeId = params?.id as string;
    const { user } = useAuth();

    const {
        conversations,
        isLoading,
        isLoadingMore,
        hasMore,
        loadMore
    } = useConversations();

    // Khởi tạo InView để bắt sự kiện scroll to bottom
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "100px 0px"
    });

    useEffect(() => {
        if (inView && hasMore && !isLoadingMore) {
            loadMore();
        }
    }, [inView, hasMore, isLoadingMore, loadMore]);

    return (
        <div className={clsx(
            "h-full min-w-0 flex-col bg-card md:w-85 md:shrink-0 md:border-r md:border-border",
            activeId ? "hidden md:flex" : "flex w-full"
        )}>
            {/* Header Sidebar & Thanh tìm kiếm giữ nguyên... */}
            <div className="p-4 flex items-center justify-between">
                <h1 className="font-bold text-2xl text-foreground">Đoạn chat</h1>
                <div className="flex gap-2">
                    <button className="hidden p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors text-foreground">
                        <MoreHorizontal size={20} />
                    </button>
                    <button onClick={() => setIsCreateGroupOpen(true)} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors text-foreground">
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="px-4 pb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm trên Messenger..."
                        className="w-full bg-muted text-foreground pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Danh sách */}
            <div className="min-h-0 flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center p-3 animate-pulse">
                            <div className="w-14 h-14 bg-muted rounded-full mr-3"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <>
                        {conversations.map((conv) => {
                            const isShowDotOnline = shouldShowDotOnline(conv, user?.id);

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => router.push(`/chat/${conv.id}`)}
                                    className={clsx(
                                        "flex items-center p-3 rounded-xl cursor-pointer transition-colors duration-200 relative group",
                                        activeId === conv.id ? "bg-primary/10" : "hover:bg-muted"
                                    )}
                                >
                                    <div className="shrink-0 mr-3">
                                        <ConversationAvatar
                                            conversation={conv}
                                            isShowDotOnline={isShowDotOnline}
                                            className="w-14 h-14"
                                            dotClassName="w-3.5 h-3.5"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={clsx("text-[15px] truncate", conv.hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                                                {conv.name || "Người dùng"}
                                            </h3>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { locale: vi, addSuffix: true }).replace('khoảng ', '').replace(' trước', '') : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className={clsx("text-sm truncate pr-2", conv.hasUnread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                                                {conv.lastMessage?.type === "System" ? (
                                                    // Nếu là tin nhắn hệ thống, gọi hàm format
                                                    formatSystemMessage(conv.lastMessage, user?.id)
                                                ) : (
                                                    // Nếu là tin nhắn thường, giữ nguyên logic cũ
                                                    <>
                                                        {conv.lastMessage?.senderId === user?.id ? 'Bạn: ' : ''}
                                                        {conv.lastMessage?.senderId !== user?.id ? `${conv.lastMessage?.senderName}: ` : ''}
                                                        {conv.lastMessage?.content || "Đã gửi một tệp đính kèm"}
                                                    </>
                                                )}
                                            </p>
                                            {conv.hasUnread && <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0"></div>}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Loader element nằm ở cuối danh sách */}
                        {hasMore && (
                            <div ref={loadMoreRef} className="flex justify-center py-4">
                                {isLoadingMore ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : null}
                            </div>
                        )}
                    </>
                )}
            </div>

            <CreateGroupModal
                isOpen={isCreateGroupOpen}
                onClose={() => setIsCreateGroupOpen(false)}
                onSuccess={(id) => {
                    router.push(`/chat/${id}`);
                }}
            />
        </div>
    );
}
