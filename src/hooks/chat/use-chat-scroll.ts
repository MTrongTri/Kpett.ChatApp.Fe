import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    useCallback
} from 'react';
import { useInView } from 'react-intersection-observer';
import { MessageResponse } from '@/types/chat';

interface UseChatScrollProps {
    messages: MessageResponse[];
    hasMore: boolean;
    isLoadingMore: boolean;
    loadOlderMessages: () => void;
    currentUserId?: string;
    isMinimized?: boolean;
}

export function useChatScroll({
    messages,
    hasMore,
    isLoadingMore,
    loadOlderMessages,
    currentUserId,
    isMinimized = false
}: UseChatScrollProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const fetchLockRef = useRef(false);
    const isInitialScrolled = useRef(false);
    const previousScroll = useRef({ height: 0, top: 0 });
    const buttonVisibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [showNewMessageButton, setShowNewMessageButton] = useState(false);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "150px 0px 0px 0px"
    });

    const clearButtonVisibilityTimer = useCallback(() => {
        if (buttonVisibilityTimerRef.current) {
            clearTimeout(buttonVisibilityTimerRef.current);
            buttonVisibilityTimerRef.current = null;
        }
    }, []);

    const scheduleButtonVisibility = useCallback(
        (isVisible: boolean) => {
            clearButtonVisibilityTimer();
            buttonVisibilityTimerRef.current = setTimeout(() => {
                setShowNewMessageButton(isVisible);
                buttonVisibilityTimerRef.current = null;
            }, 0);
        },
        [clearButtonVisibilityTimer]
    );

    const scrollToBottomDom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        if (
            inView &&
            hasMore &&
            !isLoadingMore &&
            isInitialScrolled.current &&
            !fetchLockRef.current &&
            !isMinimized
        ) {
            fetchLockRef.current = true;
            loadOlderMessages();
        }
    }, [inView, hasMore, isLoadingMore, loadOlderMessages, isMinimized]);

    useEffect(() => {
        if (!isLoadingMore) {
            const timer = setTimeout(() => {
                fetchLockRef.current = false;
            }, 100);

            return () => clearTimeout(timer);
        }

        fetchLockRef.current = true;
    }, [isLoadingMore]);

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        previousScroll.current.top = scrollTop;

        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        if (isNearBottom && showNewMessageButton) {
            setShowNewMessageButton(false);
        }
    }, [showNewMessageButton]);

    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || isMinimized) return;

        const currentHeight = container.scrollHeight;
        const previousHeight = previousScroll.current.height;

        if (
            previousHeight > 0 &&
            currentHeight > previousHeight &&
            previousScroll.current.top <= 200
        ) {
            const heightDiff = currentHeight - previousHeight;
            container.scrollTop = previousScroll.current.top + heightDiff;
        }

        previousScroll.current.height = currentHeight;
    }, [messages, isMinimized]);

    const newestMessage = messages[messages.length - 1];
    const newestMessageId = newestMessage?.id;

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        scrollToBottomDom(behavior);
        clearButtonVisibilityTimer();
        setShowNewMessageButton(false);
    }, [scrollToBottomDom, clearButtonVisibilityTimer]);

    useEffect(() => {
        if (isMinimized || !newestMessageId) {
            if (isMinimized) {
                isInitialScrolled.current = false;
                scheduleButtonVisibility(false);
            }

            return;
        }

        const container = scrollContainerRef.current;
        if (!container) return;

        if (!isInitialScrolled.current) {
            scrollToBottomDom('auto');
            isInitialScrolled.current = true;
            scheduleButtonVisibility(false);
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        const isMyMessage = newestMessage.senderId === currentUserId;

        if (isMyMessage || isNearBottom) {
            scrollToBottomDom('smooth');
            scheduleButtonVisibility(false);
            return;
        }

        scheduleButtonVisibility(true);
    }, [
        newestMessage,
        newestMessageId,
        isMinimized,
        scrollToBottomDom,
        currentUserId,
        scheduleButtonVisibility
    ]);

    useEffect(() => {
        return () => {
            clearButtonVisibilityTimer();
        };
    }, [clearButtonVisibilityTimer]);

    return {
        scrollContainerRef,
        messagesEndRef,
        loadMoreRef,
        handleScroll,
        showNewMessageButton,
        scrollToBottom
    };
}
