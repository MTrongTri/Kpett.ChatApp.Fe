"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Mic, Send, Smile } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';

// 1. IMPORT USE THEME
import { useTheme } from 'next-themes';

interface ChatInputAreaProps {
    onSendMessage: (content: string) => void;
    /** Gọi mỗi khi user gõ phím (để gửi tín hiệu typing lên server) */
    onTyping?: () => void;
    /** Gọi khi user blur khỏi input (để lập tức dừng typing) */
    onStopTyping?: () => void;
    className?: string;
}

export function ChatInputArea({ onSendMessage, onTyping, onStopTyping }: ChatInputAreaProps) {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // 2. LẤY THEME TỪ NEXT-THEMES
    const { resolvedTheme } = useTheme();
    // Biến state để tránh lỗi Hydration Mismatch của Next.js
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        onSendMessage(inputValue);
        setInputValue("");
    };

    const handleEmojiSelect = (emojiData: EmojiClickData, event: MouseEvent) => {
        const input = inputRef.current;
        const emoji = emojiData.emoji;

        if (input) {
            const start = input.selectionStart || 0;
            const end = input.selectionEnd || 0;
            const newValue = inputValue.substring(0, start) + emoji + inputValue.substring(end);

            setInputValue(newValue);

            setTimeout(() => {
                input.focus();
                input.setSelectionRange(start + emoji.length, start + emoji.length);
            }, 0);
        } else {
            setInputValue(prev => prev + emoji);
        }
    };

    // 3. MAP THEME CỦA WEB SANG THEME CỦA EMOJI PICKER
    const emojiTheme = resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT;

    return (
        <div className="p-2 bg-background border-t border-border">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <button
                    type="button"
                    className="hidden text-primary hover:bg-muted p-1.5 rounded-full transition outline-none"
                    title="Gửi ảnh"
                >
                    <ImageIcon size={18} />
                </button>

                <div className="flex-1 bg-muted rounded-full flex items-center px-3 py-1.5">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            if (e.target.value) onTyping?.();
                        }}
                        onBlur={() => onStopTyping?.()}
                        placeholder="Aa"
                        className="flex-1 py-1 bg-transparent text-sm text-foreground outline-none w-full"
                    />

                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="hover:bg-background/50 p-1 rounded-full transition outline-none"
                            >
                                <Smile size={18} className="text-primary cursor-pointer" />
                            </button>
                        </PopoverTrigger>

                        <PopoverContent
                            side="top"
                            align="end"
                            sideOffset={10}
                            className="w-auto p-0 py-2 border-none shadow-2xl bg-transparent"
                        >
                            {/* Chỉ render Emoji Picker khi component đã mount xong để tránh lỗi SSR */}
                            {isMounted && (
                                <EmojiPicker
                                    onEmojiClick={handleEmojiSelect}
                                    autoFocusSearch={false}
                                    theme={emojiTheme}
                                    searchPlaceHolder="Tìm kiếm emoji..."
                                    width={320}
                                    height={400}
                                    lazyLoadEmojis={true}
                                    previewConfig={{
                                        showPreview: false
                                    }}
                                    className='pb-4'
                                />
                            )}
                        </PopoverContent>
                    </Popover>
                </div>

                {inputValue.trim() ? (
                    <button
                        type="submit"
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition outline-none"
                    >
                        <Send size={18} />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition outline-none"
                        title="Gửi tin nhắn thoại"
                    >
                        <Mic size={18} />
                    </button>
                )}
            </form>
        </div>
    );
}