"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Image as ImageIcon, Info, Loader2, Mic, Paperclip, Phone, Send, Smile, Video } from 'lucide-react';

import { useAuth } from '@/components/providers/auth-provider';
import { useChatMessages } from '@/hooks/chat/use-chat-messages';
import { chatService } from '@/services/chat.service';
import { MessageResponse } from '@/types/chat';

import ChatMessageBubble from './chat-message-bubble';
import { ConversationAvatar } from './conversation-avatar';
import { useConversations } from '@/hooks/chat/use-conversations';
import { formatMessageDateHeader, formatMessageTime } from '@/lib/format-date-utils';
import { ChatInputArea } from './chat-input-area';

export default function ChatWindow({ conversationId, toggleInfo }: { conversationId: string, toggleInfo: () => void }) {
    const { user } = useAuth();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const fetchLockRef = useRef<boolean>(false);
    const isInitialScrolled = useRef<boolean>(false);
    const previousScroll = useRef({ height: 0, top: 0 });

    const { conversations, isLoading: isConversationsLoading } = useConversations();
    const currentConversation = conversations.find((c: any) => c.id === conversationId);

    const isOnline = currentConversation?.participants
        ?.filter((p: any) => p.id !== user?.id)
        ?.some((p: any) => p.isOnline);

    const {
        messages,
        addMessageToCache,
        hasMore,
        isLoadingMore,
        loadOlderMessages,
        updateMessageStatus
    } = useChatMessages(isConversationsLoading ? null : conversationId);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "150px 0px 0px 0px"
    });

    useEffect(() => {
        if (inView && hasMore && !isLoadingMore && isInitialScrolled.current && !fetchLockRef.current) {
            fetchLockRef.current = true;
            loadOlderMessages();
        }
    }, [inView, hasMore, isLoadingMore, loadOlderMessages]);

    useEffect(() => {
        if (!isLoadingMore) {
            const timer = setTimeout(() => { fetchLockRef.current = false; }, 100);
            return () => clearTimeout(timer);
        } else {
            fetchLockRef.current = true;
        }
    }, [isLoadingMore]);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            previousScroll.current.top = scrollContainerRef.current.scrollTop;
        }
    };

    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const currentHeight = container.scrollHeight;
        const previousHeight = previousScroll.current.height;

        if (previousHeight > 0 && currentHeight > previousHeight && previousScroll.current.top <= 200) {
            const heightDiff = currentHeight - previousHeight;
            container.scrollTop = previousScroll.current.top + heightDiff;
        }
        previousScroll.current.height = currentHeight;
    }, [messages]);

    const newestMessageId = messages[messages.length - 1]?.id;

    useEffect(() => {
        if (!newestMessageId) return;
        if (!isInitialScrolled.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            isInitialScrolled.current = true;
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [newestMessageId]);

    const handleSend = async (content: string) => {
        const clientMessageId = crypto.randomUUID();

        const optimisticMsg: MessageResponse = {
            id: clientMessageId,
            clientMessageId: clientMessageId,
            senderId: user?.id || "",
            senderName: user?.displayName || "",
            type: "Text",
            content: content,
            createdAt: new Date().toISOString(),
            localStatus: "sending"
        };

        addMessageToCache(optimisticMsg);

        try {
            await chatService.sendMessage(conversationId, content, "Text", clientMessageId);
        } catch (error) {
            console.error(error);
            updateMessageStatus(clientMessageId, "error");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background relative">
            {/* Header - Giữ nguyên */}
            <div className="h-16 border-b border-border flex items-center justify-between px-4 bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <div className="flex items-center cursor-pointer hover:bg-muted p-2 rounded-xl transition">
                    {currentConversation ? (
                        <>
                            <div className="shrink-0 mr-3">
                                <ConversationAvatar
                                    conversation={currentConversation}
                                    isShowDotOnline={true}
                                    className="w-10 h-10"
                                />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[15px] text-foreground leading-tight">
                                    {currentConversation.name || "Người dùng"}
                                </h2>
                                {isOnline ? (
                                    <span className="text-xs text-emerald-500 font-medium">Đang hoạt động</span>
                                ) : (
                                    <span className="text-xs text-muted-foreground font-medium">Ngoại tuyến</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted animate-pulse border border-border"></div>
                            <div className="h-4 w-28 bg-muted animate-pulse rounded"></div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 text-primary">
                    <button className="p-2 hover:bg-primary/10 rounded-full transition"><Phone size={20} /></button>
                    <button className="p-2 hover:bg-primary/10 rounded-full transition"><Video size={20} /></button>
                    <button onClick={toggleInfo} className="p-2 hover:bg-primary/10 rounded-full transition"><Info size={20} /></button>
                </div>
            </div>

            {/* Message Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-muted/10"
            >
                {hasMore && (
                    <div ref={loadMoreRef} style={{ overflowAnchor: 'none' }} className="flex justify-center py-4">
                        {isLoadingMore ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <span className="text-xs text-muted-foreground">Cuộn để tải thêm...</span>}
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMine = msg.senderId === user?.id;
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const isConsecutive = prevMsg?.senderId === msg.senderId && msg.type !== "System";

                    // --- LOGIC PHÂN CHIA NGÀY ---
                    const currentDateLabel = formatMessageDateHeader(msg.createdAt);
                    const prevDateLabel = prevMsg ? formatMessageDateHeader(prevMsg.createdAt) : null;
                    const showDateDivider = currentDateLabel !== prevDateLabel;

                    const readers = currentConversation?.participants?.filter(
                        (p: any) => p.id !== user?.id && p.lastReadMessageId === msg.id
                    ) || [];

                    const isLastMessage = index === messages.length - 1;

                    return (
                        <React.Fragment key={msg.id}>
                            {/* Dòng phân chia ngày */}
                            {showDateDivider && (
                                <div className="flex justify-center my-6">
                                    <span className="px-3 py-1 bg-background border border-border rounded-full text-[11px] font-medium text-muted-foreground shadow-sm">
                                        {currentDateLabel}
                                    </span>
                                </div>
                            )}

                            <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-4`}>
                                <ChatMessageBubble
                                    msg={msg}
                                    isMine={isMine}
                                    isConsecutive={isConsecutive}
                                    readers={readers}
                                    isLastMessage={isLastMessage}
                                />
                            </div>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <ChatInputArea onSendMessage={handleSend} />
        </div>
    );
}