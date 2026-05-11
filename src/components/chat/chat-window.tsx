"use client";

import React, { useState, useCallback } from 'react';
import { Image as ImageIcon, Info, Loader2, Mic, Paperclip, Phone, Send, Smile, Video, ArrowDown } from 'lucide-react';

import { useAuth } from '@/components/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { useChatMessages } from '@/hooks/chat/use-chat-messages';
import { useChatScroll } from '@/hooks/chat/use-chat-scroll';
import { useTyping } from '@/hooks/chat/use-typing';
import { chatService } from '@/services/chat.service';
import { MessageResponse, TypingEventPayload } from '@/types/chat';

import ChatMessageBubble from './chat-message-bubble';
import { ConversationAvatar } from './conversation-avatar';
import { useConversations } from '@/hooks/chat/use-conversations';
import { formatMessageDateHeader, formatMessageTime } from '@/lib/format-date-utils';
import { ChatInputArea } from './chat-input-area';
import { TypingIndicator } from './typing-indicator';
import { useConversationPresenceSync } from '@/hooks/chat/use-conversation-presence-sync';
import { shouldShowDotOnline } from '@/lib/conversation-utils';
import { is } from 'date-fns/locale';

export default function ChatWindow({ conversationId, toggleInfo }: { conversationId: string, toggleInfo: () => void }) {
    const { user } = useAuth();

    const { conversations, isLoading: isConversationsLoading } = useConversations();
    const currentConversationFromList = conversations.find((c: any) => c.id === conversationId);

    const { data: fetchedConversation } = useQuery({
        queryKey: ['conversation', conversationId],
        queryFn: () => chatService.getConversationById(conversationId),
        enabled: !currentConversationFromList && !!conversationId,
    });

    const currentConversation = currentConversationFromList || fetchedConversation;

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

    useConversationPresenceSync(currentConversation?.id!, currentConversation?.participants!);

    // ---- TYPING INDICATOR ----
    const [typers, setTypers] = useState<Map<string, TypingEventPayload>>(new Map());
    const handleTypingChange = useCallback((newTypers: Map<string, TypingEventPayload>) => {
        setTypers(new Map(newTypers));
    }, []);

    const { notifyTyping, notifyStopTyping } = useTyping(conversationId, handleTypingChange);

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

    const isShowDotOnline = currentConversation ? shouldShowDotOnline(currentConversation, user?.id) : false;

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
                                    isShowDotOnline={isShowDotOnline}
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

            {/* New Message Floating Button */}
            {showNewMessageButton && (
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
                onTyping={notifyTyping}
                onStopTyping={notifyStopTyping}
            />
        </div>
    );
}