"use client";

import React, { useRef, useState } from "react";
import { Image as ImageIcon, Mic, Send, Smile, Sticker } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { uploadFileToCloudinary } from "@/services/media.service";
import { StickerPicker } from "./sticker-picker";

interface AttachmentInfo {
  type: string;
  url: string;
  publicId?: string;
  filename?: string;
  fileSize?: number;
}

interface ChatInputAreaProps {
  onSendMessage: (content: string) => void;
  onSendAttachments?: (content: string, attachments: AttachmentInfo[]) => void;
  onSendSticker?: (stickerUrl: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  className?: string;
}

export function ChatInputArea({
  onSendMessage,
  onSendAttachments,
  onSendSticker,
  onTyping,
  onStopTyping,
}: ChatInputAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isStickerOpen, setIsStickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadFileToCloudinary(file, "chat");
        const attachment: AttachmentInfo = {
          type: result.type,
          url: result.url,
          publicId: result.publicId,
          filename: file.name,
          fileSize: file.size,
        };
        onSendAttachments?.("", [attachment]);
      }
    } catch (error) {
      console.error("[ChatInputArea] Upload image failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleStickerSelect = (stickerUrl: string) => {
    onSendSticker?.(stickerUrl);
    setIsStickerOpen(false);
  };

  const emojiTheme = resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT;

  return (
    <div className="bg-background border-t border-border p-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-primary hover:bg-muted rounded-full p-1.5 transition outline-none disabled:opacity-50"
          title="Gửi ảnh"
        >
          <ImageIcon size={18} />
        </button>

        <Popover open={isStickerOpen} onOpenChange={setIsStickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-primary hover:bg-muted rounded-full p-1.5 transition outline-none"
              title="Gửi sticker"
            >
              <Sticker size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={10}
            className="w-[320px] border border-border bg-card p-0 shadow-2xl"
          >
            <StickerPicker onStickerSelect={handleStickerSelect} />
          </PopoverContent>
        </Popover>

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
            placeholder={isUploading ? "Đang tải ảnh lên..." : "Aa"}
            disabled={isUploading}
            className="text-foreground w-full flex-1 bg-transparent py-1 text-sm outline-none disabled:opacity-50"
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
