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
import { useEffect, useImperativeHandle, useState } from "react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { UserAvatar } from "../user/user-avatar";
import MentionList from "./mention-list";

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

  const isEditing = !!defaultValue;

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: "end",
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        codeBlock: false,
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
            let component: ReactRenderer;
            let popup: TippyInstance[];

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) return;

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect as any,
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
                  getReferenceClientRect: props.clientRect as any,
                });
              },

              onKeyDown(props) {
                if (props.event.key === "Escape") {
                  popup?.[0]?.hide();
                  return true;
                }
                return (component?.ref as any)?.onKeyDown(props);
              },

              onExit() {
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

  const handlePublish = async () => {
    if (!editor || editor.isEmpty) return;

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
  };

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

          <button
            onClick={handlePublish}
            disabled={isButtonDisabled}
            className="text-primary hover:text-primary/80 mb-0.5 cursor-pointer text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? (isEditing ? "Đang lưu..." : "Đang gửi...")
              : (isEditing ? "Lưu" : "Đăng")}
          </button>
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
