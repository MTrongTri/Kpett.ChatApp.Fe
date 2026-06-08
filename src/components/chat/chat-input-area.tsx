"use client";

import React, { useRef, useState } from "react";
import { Image as ImageIcon, Mic, Send, Smile } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatInputAreaProps {
  onSendMessage: (content: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  className?: string;
}

export function ChatInputArea({
  onSendMessage,
  onTyping,
  onStopTyping,
}: ChatInputAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme } = useTheme();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    const input = inputRef.current;
    const emoji = emojiData.emoji;

    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue =
        inputValue.substring(0, start) + emoji + inputValue.substring(end);

      setInputValue(newValue);

      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
      return;
    }

    setInputValue((previous) => previous + emoji);
  };

  const emojiTheme = resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT;

  return (
    <div className="bg-background border-t border-border p-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <button
          type="button"
          className="text-primary hover:bg-muted hidden rounded-full p-1.5 transition outline-none"
          title="Gui anh"
        >
          <ImageIcon size={18} />
        </button>

        <div className="bg-muted flex flex-1 items-center rounded-full px-3 py-1.5">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              if (event.target.value) {
                onTyping?.();
              }
            }}
            onBlur={() => onStopTyping?.()}
            placeholder="Aa"
            className="text-foreground w-full flex-1 bg-transparent py-1 text-sm outline-none"
          />

          <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="hover:bg-background/50 rounded-full p-1 transition outline-none"
              >
                <Smile size={18} className="text-primary cursor-pointer" />
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="top"
              align="end"
              sideOffset={10}
              className="w-auto border-none bg-transparent p-0 py-2 shadow-2xl"
            >
              {isEmojiOpen && (
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  autoFocusSearch={false}
                  theme={emojiTheme}
                  searchPlaceHolder="Tim kiem emoji..."
                  width={320}
                  height={400}
                  lazyLoadEmojis
                  previewConfig={{
                    showPreview: false,
                  }}
                  className="pb-4"
                />
              )}
            </PopoverContent>
          </Popover>
        </div>

        {inputValue.trim() ? (
          <button
            type="submit"
            className="text-primary hover:bg-primary/10 rounded-full p-1.5 transition outline-none"
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="text-primary hover:bg-primary/10 rounded-full p-1.5 transition outline-none"
            title="Gui tin nhan thoai"
          >
            <Mic size={18} />
          </button>
        )}
      </form>
    </div>
  );
}
