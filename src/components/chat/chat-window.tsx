"use client";

import React, { useState, useCallback } from 'react';
import { ArrowDown, ArrowLeft, Info, Loader2, Phone, Video } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/components/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { useChatMessages } from '@/hooks/chat/use-chat-messages';
import { useChatScroll } from '@/hooks/chat/use-chat-scroll';
import { useTyping } from '@/hooks/chat/use-typing';
import { chatService } from '@/services/chat.service';
import { ConversationResponse, MessageResponse, TypingEventPayload } from '@/types/chat';

import ChatMessageBubble from './chat-message-bubble';
import { ConversationAvatar } from './conversation-avatar';
import { useConversations } from '@/hooks/chat/use-conversations';
import { formatMessageDateHeader } from '@/lib/format-date-utils';
import { ChatInputArea } from './chat-input-area';
import { ChatMessageListSkeleton } from './chat-message-list-skeleton';
import { TypingIndicator } from './typing-indicator';
import { useConversationPresenceSync } from '@/hooks/chat/use-conversation-presence-sync';
import { shouldShowDotOnline } from '@/lib/conversation-utils';
import { ChatEmptyState } from './chat-empty-state';
import { ChatMessageList } from './chat-message-list';
interface ChatWindowProps {
    conversationId: string;
    toggleInfo: () => void;
    mobileBackHref?: string;
}

export default function ChatWindow({ conversationId, toggleInfo, mobileBackHref }: ChatWindowProps) {
    const { user } = useAuth();

    const { conversations, isLoading: isConversationsLoading } = useConversations();
    const currentConversationFromList = conversations.find((c) => c.id === conversationId);

    const { data: fetchedConversation } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: () => chatService.getConversationById(conversationId),
        enabled: !currentConversationFromList && !!conversationId,
    });

    const currentConversation = (currentConversationFromList || fetchedConversation) as ConversationResponse | undefined;

    const isOnline = currentConversation?.participants
        ?.filter((p) => p.id !== user?.id)
        ?.some((p) => p.isOnline);

    const {
        messages,
        addMessageToCache,
        hasMore,
        isLoading: isMessagesLoading,
        isLoadingMore,
        loadOlderMessages,
        updateMessageStatus
    } = useChatMessages(isConversationsLoading ? null : conversationId);

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
        currentUserId: user?.id
    });

    useConversationPresenceSync(currentConversation?.id ?? "", currentConversation?.participants ?? []);
    const isInitialChatLoading = isConversationsLoading || isMessagesLoading;

    // ---- TYPING INDICATOR ----
    const [typers, setTypers] = useState<Map<string, TypingEventPayload>>(new Map());
    const handleTypingChange = useCallback((newTypers: Map<string, TypingEventPayload>) => {
        setTypers(new Map(newTypers));
    }, []);

    const { notifyTyping, notifyStopTyping } = useTyping(conversationId, handleTypingChange);

    const handleSend = async (content: string, attachments?: { type: string; url: string; publicId?: string; filename?: string; fileSize?: number }[]) => {
        const clientMessageId = crypto.randomUUID();
        const hasAttachments = attachments && attachments.length > 0;
        const hasImage = hasAttachments && attachments!.some((a) => a.type === "image");
        const messageType = hasImage ? "Image" : hasAttachments ? "File" : "Text";

        const optimisticMsg: MessageResponse = {
            id: clientMessageId,
            clientMessageId: clientMessageId,
            senderId: user?.id || "",
            senderName: user?.displayName || "",
            type: messageType,
            content: content,
            createdAt: new Date().toISOString(),
            localStatus: "sending",
            ...(hasAttachments
                ? {
                      attachments: attachments!.map((a, i) => ({
                          id: `${clientMessageId}-att-${i}`,
                          messageId: clientMessageId,
                          type: a.type,
                          url: a.url,
                          publicId: a.publicId,
                          filename: a.filename,
                          fileSize: a.fileSize,
                      })),
                  }
                : {}),
        };

        addMessageToCache(optimisticMsg);

        try {
            await chatService.sendMessage(conversationId, content, messageType, clientMessageId, attachments);
            updateMessageStatus(clientMessageId, "sent");
        } catch (error) {
            console.error(error);
            updateMessageStatus(clientMessageId, "error");
        }
    };

    const handleSendAttachments = async (content: string, attachments: { type: string; url: string; publicId?: string; filename?: string; fileSize?: number }[]) => {
        const clientMessageId = crypto.randomUUID();
        const hasImage = attachments.some((a) => a.type === "image");
        const messageType = hasImage ? "Image" : "File";

        const optimisticMsg: MessageResponse = {
            id: clientMessageId,
            clientMessageId: clientMessageId,
            senderId: user?.id || "",
            senderName: user?.displayName || "",
            type: messageType,
            content: content,
            createdAt: new Date().toISOString(),
            localStatus: "sending",
            attachments: attachments.map((a, i) => ({
                id: `${clientMessageId}-att-${i}`,
                messageId: clientMessageId,
                type: a.type,
                url: a.url,
                publicId: a.publicId,
                filename: a.filename,
                fileSize: a.fileSize,
            })),
        };

        addMessageToCache(optimisticMsg);

        try {
            await chatService.sendMessage(conversationId, content, messageType, clientMessageId, attachments);
            updateMessageStatus(clientMessageId, "sent");
        } catch (error) {
            console.error(error);
            updateMessageStatus(clientMessageId, "error");
        }
    };

    const handleSendSticker = async (stickerUrl: string) => {
        const clientMessageId = crypto.randomUUID();

        const optimisticMsg: MessageResponse = {
            id: clientMessageId,
            clientMessageId: clientMessageId,
            senderId: user?.id || "",
            senderName: user?.displayName || "",
            type: "Sticker",
            content: stickerUrl,
            createdAt: new Date().toISOString(),
            localStatus: "sending"
        };

        addMessageToCache(optimisticMsg);

        const attachment = { type: "sticker", url: stickerUrl };

        try {
            await chatService.sendMessage(conversationId, stickerUrl, "Sticker", clientMessageId, [attachment]);
            updateMessageStatus(clientMessageId, "sent");
        } catch (error) {
            console.error(error);
            updateMessageStatus(clientMessageId, "error");
        }
    };

    const isShowDotOnline = currentConversation ? shouldShowDotOnline(currentConversation, user?.id) : false;

    return (
        <div className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background">
            {/* Header - Giữ nguyên */}
            <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/80 px-2 shadow-sm backdrop-blur-md sm:px-4">
                {mobileBackHref && (
                    <Link
                        href={mobileBackHref}
                        className="inline-flex shrink-0 rounded-full p-2 text-primary transition hover:bg-primary/10 md:hidden"
                        aria-label="Quay lại danh sách chat"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                )}

                <div className="flex min-w-0 flex-1 cursor-pointer items-center rounded-xl p-2 transition hover:bg-muted">
                    {currentConversation ? (
                        <>
                            <div className="shrink-0 mr-3">
                                <ConversationAvatar
                                    conversation={currentConversation}
                                    isShowDotOnline={isShowDotOnline}
                                    className="w-10 h-10"
                                />
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate font-semibold text-[15px] leading-tight text-foreground">
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
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted animate-pulse border border-border"></div>
                            <div className="h-4 w-28 bg-muted animate-pulse rounded"></div>
                        </div>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5 text-primary sm:gap-1">
                    <button className="rounded-full p-2 transition hover:bg-primary/10" aria-label="Gọi thoại"><Phone size={20} /></button>
                    <button className="rounded-full p-2 transition hover:bg-primary/10" aria-label="Gọi video"><Video size={20} /></button>
                    <button onClick={toggleInfo} className="inline-flex rounded-full p-2 transition hover:bg-primary/10" aria-label="Thông tin hội thoại"><Info size={20} /></button>
                </div>
            </div>

            {/* Message Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="min-h-0 flex-1 overflow-y-auto bg-muted/10 p-3 custom-scrollbar sm:p-4"
            >
                {isInitialChatLoading ? (
                    <ChatMessageListSkeleton />
                ) : (
                    <>
                        {hasMore && (
                            <div ref={loadMoreRef} style={{ overflowAnchor: 'none' }} className="flex justify-center py-4">
                                {isLoadingMore ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <span className="text-xs text-muted-foreground">Cuộn để tải thêm...</span>}
                            </div>
                        )}

                        {messages.length === 0 && currentConversation ? (
                            <ChatEmptyState
                                conversation={currentConversation}
                                onSend={handleSend}
                            />
                        ) : (
                            <ChatMessageList
                                messages={messages}
                                currentUserId={user?.id}
                                conversation={currentConversation}
                            />
                        )}
                    </>
                )}
                {!isInitialChatLoading && <div ref={messagesEndRef} />}
            </div>

            {/* New Message Floating Button */}
            {showNewMessageButton && !isInitialChatLoading && (
                <button
                    onClick={() => scrollToBottom()}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg text-sm flex items-center gap-2 animate-bounce z-20 cursor-pointer border border-primary-foreground/10 hover:bg-primary/90 transition-colors"
                >
                    <ArrowDown size={16} />
                    Xem các tin nhắn mới
                </button>
            )}

            {/* Input Area */}
            <TypingIndicator typers={typers} />
            <ChatInputArea
                onSendMessage={handleSend}
                onSendAttachments={handleSendAttachments}
                onSendSticker={handleSendSticker}
                onTyping={notifyTyping}
                onStopTyping={notifyStopTyping}
                allowMentions={currentConversation?.type === "Group"}
                mentionableUsers={currentConversation?.participants
                    ?.filter((p) => p.id !== user?.id)
                    .map((p) => ({
                        id: p.id,
                        displayName: p.displayName,
                        username: p.username,
                        avatarUrl: p.avatarUrl,
                    }))}
            />
        </div>
    );
}
