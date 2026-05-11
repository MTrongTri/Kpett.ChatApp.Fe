"use client";

import React from 'react';
import { TypingEventPayload } from '@/types/chat';

interface TypingIndicatorProps {
    typers: Map<string, TypingEventPayload>;
    /** Nếu true: dùng style nhỏ gọn cho popup, false: dùng style đầy đủ cho chat-window */
    compact?: boolean;
}

/**
 * Hiển thị "X đang gõ..." với animation 3 chấm lúc lắc.
 * Ẩn hoàn toàn khi không có ai gõ.
 */
export function TypingIndicator({ typers, compact = false }: TypingIndicatorProps) {
    if (typers.size === 0) return null;

    const names = Array.from(typers.values()).map(
        (t) => t.displayName || t.username || 'Ai đó'
    );

    const label =
        names.length === 1
            ? `${names[0]} đang gõ`
            : names.length === 2
            ? `${names[0]} và ${names[1]} đang gõ`
            : `${names[0]} và ${names.length - 1} người khác đang gõ`;

    return (
        <div
            className={`flex items-center gap-2 ${
                compact ? 'px-3 py-1' : 'px-4 py-2'
            } animate-in fade-in slide-in-from-bottom-1 duration-200`}
        >
            {/* Avatar nhỏ của người đầu tiên (tuỳ chọn) */}
            <div className="flex items-end gap-1.5">
                {/* Bubble chứa 3 chấm */}
                <div
                    className={`bg-muted rounded-2xl rounded-bl-sm flex items-center gap-1 ${
                        compact ? 'px-2.5 py-1.5' : 'px-3 py-2'
                    }`}
                >
                    <span className="typing-dot" />
                    <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
                    <span className="typing-dot" style={{ animationDelay: '0.30s' }} />
                </div>
            </div>

            {/* Text label */}
            <span
                className={`text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'} font-medium`}
            >
                {label}
            </span>
        </div>
    );
}
