// components/chat/chat-popup.tsx
"use client";

import { useAuth } from '@/components/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { useChatMessages } from '@/hooks/chat/use-chat-messages';
import { chatService } from '@/services/chat.service';
import { closeChatPopup, toggleMinimizePopup } from '@/store/features/chat-slice';
import { MessageResponse, TypingEventPayload } from '@/types/chat';
import { Maximize2, Minus, X, Loader2, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useChatScroll } from '@/hooks/chat/use-chat-scroll';
import { useTyping } from '@/hooks/chat/use-typing';

import ChatMessageBubble from './chat-message-bubble';
import { ConversationAvatar } from './conversation-avatar';
import { ChatInputArea } from './chat-input-area';
import { useConversations } from '@/hooks/chat/use-conversations';
import { formatMessageDateHeader } from '@/lib/format-date-utils';
import { TypingIndicator } from './typing-indicator';
import { useConversationPresenceSync } from '@/hooks/chat/use-conversation-presence-sync';
import { shouldShowDotOnline } from '@/lib/conversation-utils';

interface ChatPopupProps {
    conversationId: string;
    isMinimized: boolean;
    newMessage?: MessageResponse | null;
}

export default function ChatPopup({ conversationId, isMinimized, newMessage }: ChatPopupProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useAuth();

    const lastHandledMsgId = useRef<string | null>(null);
    const [previewText, setPreviewText] = useState<string | null>(null);

    // LẤY DỮ LIỆU TỪ CACHE & HOOKS
    const { conversations } = useConversations();
    const currentConversationFromList = conversations.find((c: any) => c.id === conversationId);

    const { data: fetchedConversation } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: () => chatService.getConversationById(conversationId),
        enabled: !currentConversationFromList,
    });

    const currentConversation = currentConversationFromList || fetchedConversation;

    const isOnline = currentConversation?.participants
        ?.filter((p: any) => p.id !== user?.id)
        .some((p: any) => p.isOnline);
    const chatName = currentConversation?.name || "Người dùng";

    const {
        messages,
        addMessageToCache,
        updateMessageStatus,
        hasMore,
        isLoadingMore,
        loadOlderMessages
    } = useChatMessages(conversationId, isMinimized);

    useConversationPresenceSync(currentConversation?.id!, currentConversation?.participants!);

    // LOGIC QUYẾT ĐỊNH HIỂN THỊ PREVIEW TEXT
    useEffect(() => {
        if (!isMinimized) {
            setPreviewText(null);
            if (newMessage) lastHandledMsgId.current = newMessage.id;
            return;
        }

        if (newMessage && isMinimized && lastHandledMsgId.current !== newMessage.id) {
            // Chỉ hiện preview nếu tin nhắn đến trong vòng 10 giây qua (chặn tin cũ hiện lại)
            const msgTime = new Date(newMessage.createdAt).getTime();
            const now = new Date().getTime();
            const isRecent = (now - msgTime) < 10000;

            if (isRecent) {
                setPreviewText(newMessage.content);
                lastHandledMsgId.current = newMessage.id;
            } else {
                lastHandledMsgId.current = newMessage.id;
            }
        }
    }, [newMessage, isMinimized]);

    // BỘ ĐẾM GIỜ TỰ XÓA PREVIEW (Độc lập để không bị kẹt)
    useEffect(() => {
        if (previewText) {
            const timer = setTimeout(() => setPreviewText(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [previewText]);

    // XỬ LÝ TẢI THÊM TIN NHẮN CŨ (INFINITE SCROLL) VÀ TỰ ĐỘNG CUỘN
    const {
        scrollContainerRef,
        messagesEndRef,
        loadMoreRef,
        handleScroll,
        showNewMessageButton,
        scrollToBottom
    } = useChatScroll({
        messages,
        hasMore,
        isLoadingMore,
        loadOlderMessages,
        currentUserId: user?.id,
        isMinimized
    });

    // ---- TYPING INDICATOR (chỉ khi popup đang mở) ----
    const [typers, setTypers] = useState<Map<string, TypingEventPayload>>(new Map());
    const handleTypingChange = useCallback((newTypers: Map<string, TypingEventPayload>) => {
        setTypers(new Map(newTypers));
    }, []);

    // Chỉ join room khi popup không bị thu nhỏ
    const { notifyTyping, notifyStopTyping } = useTyping(
        !isMinimized ? conversationId : null,
        handleTypingChange
    );

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

            updateMessageStatus(clientMessageId, "sent");

        } catch (error) {
            console.error(error);
            updateMessageStatus(clientMessageId, "error");
        }
    };

    const handleGoToFullChat = () => {
        dispatch(closeChatPopup(conversationId));
        router.push(`/chat/${conversationId}`);
    };

    let isShowDotOnline = currentConversation ? shouldShowDotOnline(currentConversation, user?.id) : false;

    // UI 1: NẾU ĐANG THU NHỎ -> HIỂN THỊ BONG BÓNG
    if (isMinimized) {
        return (
            <div className="h-17 relative group flex items-center justify-center mb-4 pointer-events-auto outline-none!">
                <span className="sr-only" tabIndex={-1} aria-hidden="true" />

                {previewText && (
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-background text-popover-foreground text-sm px-3 py-2 rounded-2xl rounded-tr-sm shadow-xl border border-border whitespace-nowrap max-w-50 truncate">
                        {previewText}
                    </div>
                )}

                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                        dispatch(closeChatPopup(conversationId));
                    }}
                    className="absolute -top-1 -right-1 z-30 w-5 h-5 bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-colors shadow-sm cursor-pointer outline-none!"
                >
                    <X size={12} strokeWidth={3} />
                </div>

                <div
                    onClick={(e) => {
                        e.preventDefault();
                        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                        dispatch(toggleMinimizePopup(conversationId));
                    }}
                    className="relative bg-transparent p-0 hover:-translate-y-1 transition-transform rounded-full cursor-pointer select-none [-webkit-tap-highlight-color:transparent] outline-none!"
                    title={`Trò chuyện với ${chatName}`}
                >
                    {currentConversation ? (
                        <>
                            <ConversationAvatar
                                conversation={currentConversation}
                                isShowDotOnline={isShowDotOnline}
                                className="w-14 h-14"
                                dotClassName="w-4 h-4 border-[2.5px]"
                            />
                            {currentConversation.hasUnread && (
                                <span className="absolute top-0 right-0 z-20 w-3.5 h-3.5 bg-destructive border-2 border-background rounded-full shadow-sm"></span>
                            )}
                        </>
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-muted animate-pulse"></div>
                    )}
                </div>
            </div>
        );
    }

    // UI 2: NẾU KHÔNG THU NHỎ -> HIỂN THỊ CỬA SỔ
    return (
        <div className="w-82.5 h-115 bg-background border border-border shadow-2xl rounded-t-xl flex flex-col pointer-events-auto overflow-hidden outline-none! ring-0!">
            <div
                className="h-12.5 px-3 bg-card border-b border-border flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors select-none outline-none!"
                onClick={() => {
                    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                    dispatch(toggleMinimizePopup(conversationId));
                }}
            >
                <div className="flex items-center gap-2 overflow-hidden outline-none!">
                    {currentConversation ? (
                        <>
                            <ConversationAvatar
                                conversation={currentConversation}
                                isShowDotOnline={isShowDotOnline}
                                className="w-8 h-8"
                                dotClassName="w-2.5 h-2.5"
                            />
                            <div className="flex flex-col outline-none!">
                                <span className="font-semibold text-sm text-foreground truncate max-w-30">
                                    {chatName}
                                </span>
                                {
                                    isShowDotOnline && (
                                        isOnline ? (
                                            <span className="text-[10px] text-emerald-500 font-medium leading-none">Đang hoạt động</span>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground font-medium leading-none">Ngoại tuyến</span>
                                        )
                                    )
                                }

                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted animate-pulse border border-border"></div>
                            <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                        </div>
                    )}
                </div>

                <div className="flex items-center text-muted-foreground gap-1 outline-none!">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                            handleGoToFullChat();
                        }}
                        className="p-1.5 hover:bg-muted hover:text-foreground rounded-full transition-colors cursor-pointer outline-none!"
                        title="Mở trong Messenger"
                    ><Maximize2 size={16} /></div>

                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                            dispatch(toggleMinimizePopup(conversationId));
                        }}
                        className="p-1.5 hover:bg-muted hover:text-foreground rounded-full transition-colors cursor-pointer outline-none!"
                        title="Thu nhỏ"
                    ><Minus size={16} /></div>

                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                            dispatch(closeChatPopup(conversationId));
                        }}
                        className="p-1.5 hover:bg-destructive/10 text-destructive rounded-full transition-colors cursor-pointer outline-none!"
                        title="Đóng"
                    ><X size={16} /></div>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar scrollbar-thin bg-muted/10 outline-none!"
            >
                {hasMore && (
                    <div ref={loadMoreRef} style={{ overflowAnchor: 'none' }} className="flex justify-center py-2">
                        {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMine = msg.senderId === user?.id;
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const isConsecutive = prevMsg?.senderId === msg.senderId && msg.type !== "System";
                    const readers = currentConversation?.participants?.filter(
                        (p: any) => p.id !== user?.id && p.lastReadMessageId === msg.id
                    ) || [];
                    const isLastMessage = index === messages.length - 1;

                    const currentDateLabel = formatMessageDateHeader(msg.createdAt);
                    const prevDateLabel = prevMsg ? formatMessageDateHeader(prevMsg.createdAt) : null;
                    const showDateDivider = currentDateLabel !== prevDateLabel;

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

                            <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-1`}>
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

            {/* New Message Floating Button */}
            {
                showNewMessageButton && !isMinimized && (
                    <button
                        onClick={() => scrollToBottom()}
                        className="absolute bottom-17.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-3 py-1.5 shadow-xl text-xs flex items-center gap-1.5 animate-bounce z-20 cursor-pointer border border-primary-foreground/10 hover:bg-primary/90 transition-colors"
                    >
                        <ArrowDown size={14} />
                        Tin nhắn mới
                    </button>
                )
            }

            <TypingIndicator typers={typers} compact />
            <ChatInputArea
                onSendMessage={handleSend}
                onTyping={notifyTyping}
                onStopTyping={notifyStopTyping}
            />
        </div >
    );
}