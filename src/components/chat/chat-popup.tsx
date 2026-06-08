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

export default function ChatPopup({
    conversationId,
    isMinimized,
    newMessage
}: ChatPopupProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useAuth();

    const lastHandledMessageIdRef = useRef<string | null>(null);
    const previewShowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const previewHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [previewText, setPreviewText] = useState<string | null>(null);

    const { conversations } = useConversations();
    const currentConversationFromList = conversations.find(
        (conversation) => conversation.id === conversationId
    );

    const { data: fetchedConversation } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: () => chatService.getConversationById(conversationId),
        enabled: !currentConversationFromList && !!conversationId,
    });

    const currentConversation =
        currentConversationFromList ?? fetchedConversation ?? null;
    const participants = currentConversation?.participants ?? [];
    const isOnline = participants
        .filter((participant) => participant.id !== user?.id)
        .some((participant) => participant.isOnline);
    const chatName = currentConversation?.name || "Nguoi dung";

    const {
        messages,
        addMessageToCache,
        updateMessageStatus,
        hasMore,
        isLoadingMore,
        loadOlderMessages
    } = useChatMessages(conversationId, isMinimized);

    useConversationPresenceSync(
        currentConversation?.id ?? conversationId,
        currentConversation?.participants ?? []
    );

    const clearPreviewTimers = useCallback(() => {
        if (previewShowTimerRef.current) {
            clearTimeout(previewShowTimerRef.current);
            previewShowTimerRef.current = null;
        }
        if (previewHideTimerRef.current) {
            clearTimeout(previewHideTimerRef.current);
            previewHideTimerRef.current = null;
        }
    }, []);

    const clearPreview = useCallback(() => {
        clearPreviewTimers();
        setPreviewText(null);
    }, [clearPreviewTimers]);

    const showPreview = useCallback((content: string) => {
        clearPreviewTimers();
        previewShowTimerRef.current = setTimeout(() => {
            setPreviewText(content);
            previewShowTimerRef.current = null;
            previewHideTimerRef.current = setTimeout(() => {
                setPreviewText(null);
                previewHideTimerRef.current = null;
            }, 4000);
        }, 0);
    }, [clearPreviewTimers]);

    useEffect(() => {
        if (!newMessage) return;

        if (!isMinimized) {
            lastHandledMessageIdRef.current = newMessage.id;
            return;
        }

        if (lastHandledMessageIdRef.current === newMessage.id) {
            return;
        }

        const messageTimestamp = new Date(newMessage.createdAt).getTime();
        const isRecent = Date.now() - messageTimestamp < 10000;
        lastHandledMessageIdRef.current = newMessage.id;

        if (isRecent) {
            showPreview(newMessage.content);
        }
    }, [newMessage, isMinimized, showPreview]);

    useEffect(() => {
        return () => {
            clearPreviewTimers();
        };
    }, [clearPreviewTimers]);

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

    const [typers, setTypers] = useState<Map<string, TypingEventPayload>>(
        new Map()
    );
    const handleTypingChange = useCallback(
        (newTypers: Map<string, TypingEventPayload>) => {
            setTypers(new Map(newTypers));
        },
        []
    );

    const { notifyTyping, notifyStopTyping } = useTyping(
        !isMinimized ? conversationId : null,
        handleTypingChange
    );

    const handleSend = async (content: string) => {
        const clientMessageId = crypto.randomUUID();

        const optimisticMessage: MessageResponse = {
            id: clientMessageId,
            clientMessageId,
            senderId: user?.id || "",
            senderName: user?.displayName || "",
            type: "Text",
            content,
            createdAt: new Date().toISOString(),
            localStatus: "sending"
        };

        addMessageToCache(optimisticMessage);

        try {
            await chatService.sendMessage(
                conversationId,
                content,
                "Text",
                clientMessageId
            );
            updateMessageStatus(clientMessageId, "sent");
        } catch (error) {
            console.error(error);
            updateMessageStatus(clientMessageId, "error");
        }
    };

    const handleGoToFullChat = () => {
        clearPreview();
        dispatch(closeChatPopup(conversationId));
        router.push(`/chat/${conversationId}`);
    };

    const isShowDotOnline = currentConversation
        ? shouldShowDotOnline(currentConversation, user?.id)
        : false;

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
                    onClick={(event) => {
                        event.stopPropagation();
                        if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                        clearPreview();
                        dispatch(closeChatPopup(conversationId));
                    }}
                    className="absolute -top-1 -right-1 z-30 w-5 h-5 bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-colors shadow-sm cursor-pointer outline-none!"
                >
                    <X size={12} strokeWidth={3} />
                </div>

                <div
                    onClick={(event) => {
                        event.preventDefault();
                        if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                        clearPreview();
                        dispatch(toggleMinimizePopup(conversationId));
                    }}
                    className="relative bg-transparent p-0 hover:-translate-y-1 transition-transform rounded-full cursor-pointer select-none [-webkit-tap-highlight-color:transparent] outline-none!"
                    title={`Tro chuyen voi ${chatName}`}
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
                                <span className="absolute top-0 right-0 z-20 w-3.5 h-3.5 bg-destructive border-2 border-background rounded-full shadow-sm" />
                            )}
                        </>
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-muted animate-pulse" />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-82.5 h-115 bg-background border border-border shadow-2xl rounded-t-xl flex flex-col pointer-events-auto overflow-hidden outline-none! ring-0!">
            <div
                className="h-12.5 px-3 bg-card border-b border-border flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors select-none outline-none!"
                onClick={() => {
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                    }
                    clearPreview();
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
                                {isShowDotOnline &&
                                    (isOnline ? (
                                        <span className="text-[10px] text-emerald-500 font-medium leading-none">
                                            Dang hoat dong
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground font-medium leading-none">
                                            Ngoai tuyen
                                        </span>
                                    ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted animate-pulse border border-border" />
                            <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                        </div>
                    )}
                </div>

                <div className="flex items-center text-muted-foreground gap-1 outline-none!">
                    <div
                        onClick={(event) => {
                            event.stopPropagation();
                            if (document.activeElement instanceof HTMLElement) {
                                document.activeElement.blur();
                            }
                            handleGoToFullChat();
                        }}
                        className="p-1.5 hover:bg-muted hover:text-foreground rounded-full transition-colors cursor-pointer outline-none!"
                        title="Mo trong Messenger"
                    >
                        <Maximize2 size={16} />
                    </div>

                    <div
                        onClick={(event) => {
                            event.stopPropagation();
                            if (document.activeElement instanceof HTMLElement) {
                                document.activeElement.blur();
                            }
                            clearPreview();
                            dispatch(toggleMinimizePopup(conversationId));
                        }}
                        className="p-1.5 hover:bg-muted hover:text-foreground rounded-full transition-colors cursor-pointer outline-none!"
                        title="Thu nho"
                    >
                        <Minus size={16} />
                    </div>

                    <div
                        onClick={(event) => {
                            event.stopPropagation();
                            if (document.activeElement instanceof HTMLElement) {
                                document.activeElement.blur();
                            }
                            clearPreview();
                            dispatch(closeChatPopup(conversationId));
                        }}
                        className="p-1.5 hover:bg-destructive/10 text-destructive rounded-full transition-colors cursor-pointer outline-none!"
                        title="Dong"
                    >
                        <X size={16} />
                    </div>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar scrollbar-thin bg-muted/10 outline-none!"
            >
                {hasMore && (
                    <div
                        ref={loadMoreRef}
                        style={{ overflowAnchor: 'none' }}
                        className="flex justify-center py-2"
                    >
                        {isLoadingMore ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : null}
                    </div>
                )}

                {messages.map((message, index) => {
                    const isMine = message.senderId === user?.id;
                    const previousMessage = index > 0 ? messages[index - 1] : null;
                    const isConsecutive =
                        previousMessage?.senderId === message.senderId &&
                        message.type !== "System";
                    const readers =
                        currentConversation?.participants.filter(
                            (participant) =>
                                participant.id !== user?.id &&
                                participant.lastReadMessageId === message.id
                        ) ?? [];
                    const isLastMessage = index === messages.length - 1;

                    const currentDateLabel = formatMessageDateHeader(
                        message.createdAt
                    );
                    const previousDateLabel = previousMessage
                        ? formatMessageDateHeader(previousMessage.createdAt)
                        : null;
                    const showDateDivider =
                        currentDateLabel !== previousDateLabel;

                    return (
                        <React.Fragment key={message.id}>
                            {showDateDivider && (
                                <div className="flex justify-center my-6">
                                    <span className="px-3 py-1 bg-background border border-border rounded-full text-[11px] font-medium text-muted-foreground shadow-sm">
                                        {currentDateLabel}
                                    </span>
                                </div>
                            )}

                            <div
                                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-1`}
                            >
                                <ChatMessageBubble
                                    msg={message}
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

            {showNewMessageButton && !isMinimized && (
                <button
                    onClick={() => scrollToBottom()}
                    className="absolute bottom-17.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-3 py-1.5 shadow-xl text-xs flex items-center gap-1.5 animate-bounce z-20 cursor-pointer border border-primary-foreground/10 hover:bg-primary/90 transition-colors"
                >
                    <ArrowDown size={14} />
                    Tin nhan moi
                </button>
            )}

            <TypingIndicator typers={typers} compact />
            <ChatInputArea
                onSendMessage={handleSend}
                onTyping={notifyTyping}
                onStopTyping={notifyStopTyping}
            />
        </div>
    );
}
