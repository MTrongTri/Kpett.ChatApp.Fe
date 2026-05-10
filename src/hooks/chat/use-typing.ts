import { useEffect, useRef, useCallback } from 'react';
import { useSignalR } from '@/components/providers/signalr-provider';
import { TypingEventPayload } from '@/types/chat';
import { useAuth } from '@/components/providers/auth-provider';

/**
 * Hook quản lý toàn bộ tính năng Typing Indicator theo tài liệu:
 * - Tự động JoinConversation khi mount / LeaveConversation khi unmount
 * - Gửi SendTyping với throttle 3s (giữ trạng thái) và debounce 1.5s (ngừng gõ)
 * - Lắng nghe sự kiện `UserTyping` từ backend
 */
export function useTyping(
    conversationId: string | null | undefined,
    onTypingChange: (typers: Map<string, TypingEventPayload>) => void
) {
    const { connection, isConnected } = useSignalR();

    const { user } = useAuth();

    // Ref lưu Map<userId, payload> của những người đang gõ
    const typersRef = useRef<Map<string, TypingEventPayload>>(new Map());

    // Ref để throttle: tránh gửi SendTyping(true) liên tục hơn 3s
    const lastSentTypingRef = useRef<number>(0);
    const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Ref để debounce: sau 1.5s không gõ thì gửi SendTyping(false)
    const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Ref theo dõi trạng thái đang gõ hiện tại
    const isCurrentlyTypingRef = useRef(false);

    // ---- JOIN / LEAVE CONVERSATION ----
    useEffect(() => {
        if (!isConnected || !connection || !conversationId) return;

        connection.invoke('JoinConversation', conversationId).catch((err: unknown) => {
            console.error('[useTyping] JoinConversation failed:', err);
        });

        return () => {
            // Nếu đang gõ thì gửi false trước khi rời phòng
            if (isCurrentlyTypingRef.current) {
                connection.invoke('SendTyping', conversationId, false).catch(() => { });
            }
            connection.invoke('LeaveConversation', conversationId).catch((err: unknown) => {
                console.error('[useTyping] LeaveConversation failed:', err);
            });
        };
    }, [connection, isConnected, conversationId]);

    // ---- LẮNG NGHE UserTyping TỪ BACKEND ----
    useEffect(() => {
        if (!isConnected || !connection || !conversationId) return;

        const handleUserTyping = (payload: TypingEventPayload) => {
            // Chỉ xử lý event thuộc conversation hiện tại
            if (payload.conversationId !== conversationId) return;

            const newTypers = new Map(typersRef.current);

            if (payload.isTyping) {
                newTypers.set(payload.userId, payload);
            } else {
                newTypers.delete(payload.userId);
            }

            typersRef.current = newTypers;
            onTypingChange(new Map(newTypers));
        };

        connection.on('UserTyping', handleUserTyping);

        return () => {
            connection.off('UserTyping', handleUserTyping);
        };
    }, [connection, isConnected, conversationId, onTypingChange]);

    // ---- CLEAR TYPERS KHI ĐỔI CONVERSATION ----
    useEffect(() => {
        typersRef.current = new Map();
        onTypingChange(new Map());
    }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ---- HÀM GỬI TYPING ----
    const sendTypingSignal = useCallback(
        (isTyping: boolean) => {
            if (!connection || !isConnected || !conversationId) return;

            const userTyped: TypingEventPayload = {
                userId: user?.id || '',
                displayName: user?.displayName || '',
                username: user?.username || '',
                avatarUrl: user?.avatarUrl || '',
                conversationId: conversationId,
                isTyping: isTyping,
                timestamp: new Date().toISOString(),
            }

            connection.invoke('SendTyping', conversationId, userTyped, isTyping).catch((err: unknown) => {
                console.error('[useTyping] SendTyping failed:', err);
            });
        },
        [connection, isConnected, conversationId]
    );

    /**
     * Gọi hàm này mỗi khi user gõ phím trong ô input.
     * - Gửi SendTyping(true) ngay lần đầu và throttle lại mỗi 3s
     * - Debounce 1.5s sau lần gõ cuối để gửi SendTyping(false)
     */
    const notifyTyping = useCallback(() => {
        const now = Date.now();

        // Hủy timer ngừng gõ cũ
        if (stopTypingTimerRef.current) {
            clearTimeout(stopTypingTimerRef.current);
        }

        // Gửi SendTyping(true) nếu chưa gửi hoặc đã >3s kể từ lần gửi cuối
        if (!isCurrentlyTypingRef.current || now - lastSentTypingRef.current > 3000) {
            isCurrentlyTypingRef.current = true;
            lastSentTypingRef.current = now;
            sendTypingSignal(true);
        }

        // Debounce: sau 1.5s không gõ → gửi false
        stopTypingTimerRef.current = setTimeout(() => {
            isCurrentlyTypingRef.current = false;
            sendTypingSignal(false);
        }, 1500);
    }, [sendTypingSignal]);

    /**
     * Gọi hàm này khi blur khỏi ô input để ngay lập tức dừng typing.
     */
    const notifyStopTyping = useCallback(() => {
        if (stopTypingTimerRef.current) {
            clearTimeout(stopTypingTimerRef.current);
        }
        if (isCurrentlyTypingRef.current) {
            isCurrentlyTypingRef.current = false;
            sendTypingSignal(false);
        }
    }, [sendTypingSignal]);

    return { notifyTyping, notifyStopTyping };
}
