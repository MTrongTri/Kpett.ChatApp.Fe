"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Mic, Send, Smile, Sticker } from "lucide-react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { uploadFile } from "@/services/media.service";
import { StickerPicker } from "./sticker-picker";
import { toast } from "sonner";
import MentionList, {
  MentionListHandle,
  MentionUser,
} from "../comment/mention-list";

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
  allowMentions?: boolean;
  mentionableUsers?: MentionUser[];
}

function getTextBeforeCaret(node: Node, offset: number): string {
  let text =
    node.nodeType === Node.TEXT_NODE
      ? (node.textContent ?? "").slice(0, offset)
      : "";
  let previous = node.previousSibling;
  while (previous) {
    text = (previous.textContent ?? "") + text;
    previous = previous.previousSibling;
  }
  return text;
}

export function ChatInputArea({
  onSendMessage,
  onSendAttachments,
  onSendSticker,
  onTyping,
  onStopTyping,
  allowMentions = false,
  mentionableUsers = [],
}: ChatInputAreaProps) {
  const [hasContent, setHasContent] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isStickerOpen, setIsStickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mentionListRef = useRef<MentionListHandle>(null);
  const mentionAnchorRef = useRef<{ node: Node; offset: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme } = useTheme();

  const emojiTheme = resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT;

  const filteredMentionUsers = useMemo(() => {
    if (!allowMentions || !mentionOpen) return [];
    const query = mentionQuery.trim().toLowerCase();
    if (!query) return mentionableUsers;
    return mentionableUsers.filter(
      (user) =>
        (user.displayName || "").toLowerCase().includes(query) ||
        (user.username || "").toLowerCase().includes(query),
    );
  }, [allowMentions, mentionOpen, mentionQuery, mentionableUsers]);

  const closeMention = () => {
    setMentionOpen(false);
    setMentionQuery("");
    mentionAnchorRef.current = null;
  };

  const serializeContent = (): string => {
    const el = editorRef.current;
    if (!el) return "";

    let text = "";
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? "";
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const element = node as HTMLElement;
      if (element.dataset.mentionId) {
        text += `<@${element.dataset.mentionId}>`;
        return;
      }
      if (element.tagName === "BR") {
        text += "\n";
        return;
      }
      for (const child of Array.from(node.childNodes)) {
        walk(child);
      }
    };
    walk(el);

    return text.replace(/\u00A0/g, " ").trim();
  };

  const insertTextAtCaret = (text: string) => {
    const el = editorRef.current;
    const selection = window.getSelection();
    if (!el) return;

    if (!selection || selection.rangeCount === 0) {
      el.appendChild(document.createTextNode(text));
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    el.normalize();
    setHasContent(true);
  };

  const handleSelectMention = (user: MentionUser) => {
    const el = editorRef.current;
    const anchor = mentionAnchorRef.current;
    const selection = window.getSelection();
    if (!el || !anchor || !selection || selection.rangeCount === 0) {
      closeMention();
      return;
    }

    const node = anchor.node;
    const queryLength = "@".length + mentionQuery.length;

    if (
      node.nodeType === Node.TEXT_NODE &&
      anchor.offset >= queryLength &&
      anchor.offset <= (node.textContent ?? "").length
    ) {
      const before = (node.textContent ?? "").slice(0, anchor.offset);
      if (before.endsWith("@" + mentionQuery)) {
        try {
          const deleteRange = document.createRange();
          deleteRange.setStart(node, anchor.offset - queryLength);
          deleteRange.setEnd(node, anchor.offset);
          deleteRange.deleteContents();

          const insertRange = document.createRange();
          insertRange.setStart(node, anchor.offset - queryLength);
          insertRange.collapse(true);

          const span = document.createElement("span");
          span.setAttribute("data-mention-id", user.id);
          span.setAttribute("data-mention-name", user.displayName);
          span.className =
            "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold px-1 rounded-sm mx-[1px]";
          span.textContent = "@" + (user.displayName || user.username);

          insertRange.insertNode(span);

          const space = document.createTextNode(" ");
          span.parentNode?.insertBefore(space, span.nextSibling);

          const caretRange = document.createRange();
          caretRange.setStartAfter(space);
          caretRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(caretRange);
        } catch {
          closeMention();
          return;
        }
      }
    }

    el.normalize();
    setHasContent(true);
    closeMention();
  };

  const handleInput = () => {
    const el = editorRef.current;
    const text = el?.innerText ?? "";
    if (text.trim()) {
      onTyping?.();
    } else {
      onStopTyping?.();
      setHasContent(false);
      closeMention();
      return;
    }

    setHasContent(true);

    if (!allowMentions) {
      closeMention();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      closeMention();
      return;
    }

    const range = selection.getRangeAt(0);
    const textBeforeCaret = getTextBeforeCaret(
      range.startContainer,
      range.startOffset,
    );
    const match = textBeforeCaret.match(/(?:^|[\s])@([^\s@]*)$/);

    if (match) {
      mentionAnchorRef.current = {
        node: range.startContainer,
        offset: range.startOffset,
      };
      setMentionQuery(match[1]);
      setMentionOpen(true);
    } else {
      closeMention();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (mentionOpen) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMention();
        return;
      }

      const handled = mentionListRef.current?.onKeyDown({
        event: e.nativeEvent,
      });
      if (handled) {
        e.preventDefault();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        closeMention();
        return;
      }

      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();

    const content = serializeContent();
    if (!content.trim()) {
      return;
    }

    onSendMessage(content);

    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    setHasContent(false);
    closeMention();
    editorRef.current?.focus();
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    insertTextAtCaret(emojiData.emoji);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plainText = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, plainText);
    handleInput();
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadFile(file, "chat");
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
      toast.error("Tải ảnh lên thất bại. Vui lòng thử lại.");
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

  useEffect(() => {
    if (!mentionOpen) return;

    const handleOutsideMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        closeMention();
      }
    };

    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () =>
      document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, [mentionOpen]);

  return (
    <div ref={rootRef} className="bg-background border-t border-border p-2">
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

        <div className="bg-muted relative flex flex-1 items-center rounded-full px-3 py-1.5">
          <div
            ref={editorRef}
            contentEditable={!isUploading}
            role="textbox"
            aria-label="Tin nhắn"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={() => onStopTyping?.()}
            onPaste={handlePaste}
            data-placeholder={isUploading ? "Đang tải ảnh lên..." : "Aa"}
            suppressContentEditableWarning
            className="text-foreground max-h-24 w-full flex-1 overflow-y-auto break-words bg-transparent py-1 text-sm outline-none empty:before:text-muted-foreground/60 empty:before:content-[attr(data-placeholder)] disabled:opacity-50"
          />

          {mentionOpen && (
            <div className="absolute bottom-full left-0 z-50 mb-2">
              <MentionList
                ref={mentionListRef}
                items={filteredMentionUsers}
                command={({ id }) => {
                  const user = mentionableUsers.find((u) => u.id === id);
                  if (user) {
                    handleSelectMention(user);
                  }
                }}
              />
            </div>
          )}

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
                  searchPlaceHolder="Tìm kiếm emoji..."
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

        {hasContent ? (
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
            title="Gửi tin nhắn thoại"
          >
            <Mic size={18} />
          </button>
        )}
      </form>
    </div>
  );
}