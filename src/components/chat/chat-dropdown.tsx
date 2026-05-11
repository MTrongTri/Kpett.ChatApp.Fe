"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { openChatPopup } from '@/store/features/chat-slice';
import { MessageCircle, MoreHorizontal, Maximize2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import clsx from 'clsx';
import Link from 'next/link';
import { ConversationAvatar } from '../chat/conversation-avatar';
import { useConversations } from '@/hooks/chat/use-conversations';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../providers/auth-provider';
import { CreateGroupModal } from './create-group-modal';
import { Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatSystemMessage } from '@/lib/message-utils';
import { shouldShowDotOnline } from '@/lib/conversation-utils';

export default function ChatHeaderDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const dispatch = useDispatch();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const router = useRouter();

    // Dùng chung hook với Sidebar
    const {
        conversations,
        isLoading,
        isLoadingMore,
        hasMore,
        loadMore
    } = useConversations();

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "50px 0px"
    });

    useEffect(() => {
        if (inView && hasMore && !isLoadingMore && isOpen) {
            loadMore();
        }
    }, [inView, hasMore, isLoadingMore, loadMore, isOpen]);

    const hasAnyUnread = conversations.some((conv: any) => conv.hasUnread);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleOpenChat = (conversationId: string) => {
        dispatch(openChatPopup(conversationId));
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "relative p-2.5 rounded-full transition-colors cursor-pointer",
                    isOpen ? "bg-primary/10 text-primary" : "bg-muted text-foreground hover:bg-muted/80"
                )}
            >
                <MessageCircle size={22} />
                {hasAnyUnread && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-destructive border-2 border-background rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="bg-background absolute top-[120%] right-0 w-90 bg-popover text-popover-foreground rounded-xl shadow-2xl border border-border z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between p-4 pb-2">
                        <h2 className="font-bold text-2xl">Đoạn chat</h2>
                        <div className="flex gap-2 text-muted-foreground">
                            <button onClick={() => setIsCreateGroupOpen(true)} className="hidden p-1.5 hover:bg-muted rounded-full transition cursor-pointer" title="Tạo nhóm">
                                <Edit size={18} />
                            </button>
                            <button className="hidden p-1.5 hover:bg-muted rounded-full transition cursor-pointer"><MoreHorizontal size={20} /></button>
                            <Link href="/chat" onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-muted rounded-full transition cursor-pointer" title="Mở toàn màn hình">
                                <Maximize2 size={18} />
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-100 p-2 space-y-1 custom-scrollbar">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center p-2 animate-pulse">
                                    <div className="w-14 h-14 bg-muted rounded-full mr-3"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-muted rounded w-2/3"></div>
                                        <div className="h-3 bg-muted rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))
                        ) : conversations.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                Không có tin nhắn nào.
                            </div>
                        ) : (
                            <>
                                {conversations.map((conv) => {
                                    const isShowDotOnline = shouldShowDotOnline(conv, user?.id);

                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => handleOpenChat(conv.id)}
                                            className="flex items-center p-2 rounded-xl cursor-pointer hover:bg-muted/60 transition-colors group relative"
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
                                                <h3 className={clsx("text-[15px] truncate", conv.hasUnread ? "font-semibold" : "font-medium")}>
                                                    {conv.name || "Người dùng"}
                                                </h3>
                                                <div className="flex items-center text-sm mt-0.5">
                                                    <span className={clsx("truncate max-w-45", conv.hasUnread ? "font-semibold" : "text-muted-foreground")}>
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
                                                    </span>
                                                    <span className="mx-1 text-muted-foreground">·</span>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { locale: vi, addSuffix: true }).replace('khoảng ', '').replace(' trước', '') : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            {conv.hasUnread ? (
                                                <div className="w-3 h-3 bg-primary rounded-full shrink-0 ml-2 shadow-sm"></div>
                                            ) : (
                                                <button className="hidden opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:bg-background rounded-full transition ml-2 border border-border bg-card shadow-sm absolute right-4 cursor-pointer">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Loader element */}
                                {hasMore && (
                                    <div ref={loadMoreRef} className="flex justify-center py-3">
                                        {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="p-2 border-t border-border bg-muted/20 text-center">
                        <Link
                            href="/chat"
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium text-primary cursor-pointer"
                        >
                            Xem tất cả trong Messenger
                        </Link>
                    </div>
                </div>
            )}
            <CreateGroupModal
                isOpen={isCreateGroupOpen}
                onClose={() => setIsCreateGroupOpen(false)}
                onSuccess={(id) => {
                    setIsOpen(false);
                    router.push(`/chat/${id}`);
                }}
            />
        </div>
    );
}