"use client";

import { CommentAuthor, MentionComment } from "@/types/comment";
import { BaseAuthor, UserProfile } from "@/types/user";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import {
  EditorContent,
  JSONContent,
  ReactRenderer,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useState, useCallback } from "react";
import tippy, {
  type GetReferenceClientRect,
  Instance as TippyInstance,
} from "tippy.js";
import { UserAvatar } from "../user/user-avatar";
import MentionList, { MentionListHandle } from "./mention-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { Smile } from "lucide-react";

interface CommentInputProps {
  author: BaseAuthor;
  defaultValue?: string;
  mentions?: MentionComment[];
  fetchMentions: (query: string) => Promise<UserProfile[]>;
  onSubmit: (content: string) => Promise<void> | void;
  isLoading?: boolean;
  replyToUser?: CommentAuthor;
  onCancel?: () => void;
}

const parseInitialContent = (text?: string, mentionsArray: MentionComment[] = []) => {
  if (!text) return "";

  let parsedText = text.replace(/<@([^>]+)>/g, (match, userId) => {
    const user = mentionsArray.find((m) => m.userId === userId);
    if (user) {
      return `<span data-type="mention" data-id="${user.userId}" data-label="${user.displayName}">@${user.displayName}</span>`;
    }
    return match;
  });

  // Convert URLs to link tags
  parsedText = parsedText.replace(/(https?:\/\/[^\s]+)/g, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });

  parsedText = parsedText.replace(/\n/g, '<br>');

  return parsedText;
};

export const CommentInput = ({
  author,
  defaultValue,
  mentions = [],
  fetchMentions,
  onSubmit,
  isLoading,
  replyToUser,
  onCancel,
}: CommentInputProps) => {
  const [hasContent, setHasContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const isMentionPopupOpen = useRef(false);
  const { resolvedTheme } = useTheme();

  const isEditing = !!defaultValue;

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    if (editor) {
      editor.commands.insertContent(emojiData.emoji);
      setHasContent(true);
    }
  };

  const emojiTheme = resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT;

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: "end",
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-blue-500 hover:underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: isEditing ? "Sửa bình luận..." : "Thêm bình luận...",
        emptyEditorClass: "is-editor-empty",
      }),
      Mention.configure({
        HTMLAttributes: {
          class:
            "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-semibold px-1 rounded-sm mx-[1px]",
        },
        suggestion: {
          items: async ({ query }) => {
            try {
              const users = await fetchMentions(query);
              return users;
            } catch (error) {
              console.error("Lỗi khi tải danh sách mention:", error);
              return [];
            }
          },

          render: () => {
            let component: ReactRenderer<MentionListHandle>;
            let popup: TippyInstance[];

            return {
              onStart: (props) => {
                isMentionPopupOpen.current = true;
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) return;

                popup = tippy("body", {
                  getReferenceClientRect:
                    props.clientRect as GetReferenceClientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "top-start",
                  popperOptions: {
                    modifiers: [
                      {
                        name: "preventOverflow",
                        options: { boundary: "viewport" },
                      },
                    ],
                  },
                });
              },

              onUpdate(props) {
                component.updateProps(props);
                if (!props.clientRect) return;
                popup[0]?.setProps({
                  getReferenceClientRect:
                    props.clientRect as GetReferenceClientRect,
                });
              },

              onKeyDown(props) {
                if (props.event.key === "Escape") {
                  popup?.[0]?.hide();
                  return true;
                }
                return component.ref?.onKeyDown(props) ?? false;
              },

              onExit() {
                isMentionPopupOpen.current = false;
                popup?.[0]?.destroy();
                component?.destroy();
              },
            };
          },
        },
      }),
    ],
    content: parseInitialContent(defaultValue, mentions),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[20px] max-h-32 overflow-y-auto py-1 pr-12 text-[14px] leading-5 text-foreground placeholder:text-muted-foreground/60",
      },
    },
  });

  useEffect(() => {
    if (editor && replyToUser && editor.isEmpty && !isEditing) {
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "mention",
            attrs: {
              id: replyToUser.id,
              label: replyToUser.displayName,
            },
          },
          {
            type: "text",
            text: " ",
          },
        ])
        .run();
    }
  }, [editor, replyToUser, isEditing]);

  // Cập nhật trạng thái rỗng/có chữ của Editor
  useEffect(() => {
    if (!editor) return;
    const update = () => setHasContent(!editor.isEmpty);
    update();
    editor.on("update", update);
    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  const handleFocus = () => editor?.chain().focus('end').run();

  const handlePublish = useCallback(async () => {
    if (!editor || editor.isEmpty || isSubmitting) return;

    const json = editor.getJSON();
    let parsedContent = "";

    // Lặp qua cây JSON của Tiptap một cách an toàn
    json.content?.forEach((node: JSONContent) => {
      if (node.type === "paragraph") {
        node.content?.forEach((child: JSONContent) => {
          if (child.type === "text") {
            parsedContent += child.text || "";
          } else if (child.type === "mention") {
            parsedContent += `<@${child.attrs?.id}>`;
          } else if (child.type === "hardBreak") {
            parsedContent += "\n";
          }
        });
        parsedContent += "\n";
      }
    });

    const finalContent = parsedContent.trim();

    try {
      setIsSubmitting(true);
      await onSubmit(finalContent);

      if (!isEditing) {
        editor.commands.clearContent();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [editor, isEditing, onSubmit, isSubmitting]);

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing &&
        !isMentionPopupOpen.current
      ) {
        event.preventDefault();
        event.stopPropagation();
        handlePublish();
      }
    };

    editor.view.dom.addEventListener("keydown", handleKeyDown, true);
    return () => editor.view.dom.removeEventListener("keydown", handleKeyDown, true);
  }, [editor, handlePublish]);

  const isButtonDisabled = !editor || !hasContent || isLoading || isSubmitting;

  return (
    <div className="z-10 shrink-0 bg-transparent">
      <div className="flex items-center gap-3">
        {
          !defaultValue && <UserAvatar user={author} />
        }

        <div className="bg-background border-foreground/40 relative flex flex-1 items-end gap-4 rounded-xl border px-3 py-2">
          <div className="flex-1 cursor-text" onClick={handleFocus}>
            <EditorContent editor={editor} />
          </div>

          <div className="flex items-center gap-3 mb-0.5">
            <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="hover:bg-background/50 rounded-full transition outline-none"
                >
                  <Smile size={18} className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                side="top"
                align="end"
                sideOffset={10}
                onWheel={(e) => e.stopPropagation()}
                className="w-auto border-none bg-transparent p-0 shadow-2xl"
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
                  />
                )}
              </PopoverContent>
            </Popover>

            <button
              onClick={handlePublish}
              disabled={isButtonDisabled}
              className="text-primary hover:text-primary/80 cursor-pointer text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? (isEditing ? "Đang lưu..." : "Đang gửi...")
                : (isEditing ? "Lưu" : "Đăng")}
            </button>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground cursor-pointer text-[12px] font-medium transition-colors"
          >
            Hủy
          </button>
        )}
      </div>
    </div>
  );
};
