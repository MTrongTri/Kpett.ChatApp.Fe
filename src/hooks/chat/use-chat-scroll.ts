import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
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
    const fetchLockRef = useRef<boolean>(false);
    const isInitialScrolled = useRef<boolean>(false);
    const previousScroll = useRef({ height: 0, top: 0 });
    
    const [showNewMessageButton, setShowNewMessageButton] = useState(false);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: "150px 0px 0px 0px"
    });

    // 1. Tải thêm tin nhắn cũ khi cuộn lên đầu
    useEffect(() => {
        if (inView && hasMore && !isLoadingMore && isInitialScrolled.current && !fetchLockRef.current && !isMinimized) {
            fetchLockRef.current = true;
            loadOlderMessages();
        }
    }, [inView, hasMore, isLoadingMore, loadOlderMessages, isMinimized]);

    useEffect(() => {
        if (!isLoadingMore) {
            const timer = setTimeout(() => { fetchLockRef.current = false; }, 100);
            return () => clearTimeout(timer);
        } else {
            fetchLockRef.current = true;
        }
    }, [isLoadingMore]);

    // 2. Giữ nguyên vị trí cuộn khi tin nhắn cũ được tải về
    const handleScroll = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            previousScroll.current.top = scrollTop;
            
            // Nếu cuộn xuống gần đáy thì tự động ẩn nút báo tin nhắn mới
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
            if (isNearBottom && showNewMessageButton) {
                setShowNewMessageButton(false);
            }
        }
    }, [showNewMessageButton]);

    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || isMinimized) return;
        const currentHeight = container.scrollHeight;
        const previousHeight = previousScroll.current.height;

        if (previousHeight > 0 && currentHeight > previousHeight && previousScroll.current.top <= 200) {
            const heightDiff = currentHeight - previousHeight;
            container.scrollTop = previousScroll.current.top + heightDiff;
        }
        previousScroll.current.height = currentHeight;
    }, [messages, isMinimized]);

    // 3. Logic cuộn xuống cuối / Hiển thị nút tin nhắn mới
    const newestMessage = messages[messages.length - 1];
    const newestMessageId = newestMessage?.id;

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
            setShowNewMessageButton(false);
        }
    }, []);

    useEffect(() => {
        if (isMinimized || !newestMessageId) {
            if (isMinimized) isInitialScrolled.current = false;
            return;
        }

        const container = scrollContainerRef.current;
        
        // Lần đầu render -> Luôn cuộn xuống mượt mà ngay lập tức
        if (!isInitialScrolled.current) {
            scrollToBottom('auto');
            isInitialScrolled.current = true;
            return;
        } 
        
        if (container) {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
            const isMyMessage = newestMessage?.senderId === currentUserId;

            // Nếu là tin nhắn của mình gửi HOẶC đang ở gần đáy màn hình -> Tự cuộn
            if (isMyMessage || isNearBottom) {
                scrollToBottom('smooth');
            } else {
                // Đang đọc tin nhắn cũ -> Không cuộn, chỉ hiện nút
                setShowNewMessageButton(true);
            }
        }
    }, [newestMessageId, isMinimized, scrollToBottom, currentUserId, newestMessage?.senderId]);

    return {
        scrollContainerRef,
        messagesEndRef,
        loadMoreRef,
        handleScroll,
        showNewMessageButton,
        scrollToBottom
    };
}
