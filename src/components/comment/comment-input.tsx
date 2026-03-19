import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import {
  useEditor,
  EditorContent,
  ReactRenderer,
  JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { BaseAuthor, UserProfile } from "@/types/user";
import { UserAvatar } from "../user/user-avatar";
import MentionList from "./mention-list";

interface CommentInputProps {
  author: BaseAuthor;
  fetchMentions: (query: string) => Promise<UserProfile[]>;
  onSubmit: (content: string) => Promise<void> | void;
  isLoading?: boolean;

  replyToUser?: BaseAuthor;
  onCancel?: () => void;
}

export const CommentInput = ({
  author,
  fetchMentions,
  onSubmit,
  isLoading,
  replyToUser,
  onCancel,
}: CommentInputProps) => {
  const [hasContent, setHasContent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "Thêm bình luận...",
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
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[20px] max-h-32 overflow-y-auto py-1 pr-12 text-[14px] leading-5 text-foreground placeholder:text-muted-foreground/60",
      },
    },
  });

  useEffect(() => {
    if (editor && replyToUser && editor.isEmpty) {
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "mention",
            attrs: {
              id: replyToUser.id,
              label: replyToUser.username,
            },
          },
          {
            type: "text",
            text: " ",
          },
        ])
        .run();
    }
  }, [editor, replyToUser]);

  useEffect(() => {
    if (!editor) return;

    const update = () => setHasContent(!editor.isEmpty);
    update();
    editor.on("update", update);

    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  const handleFocus = () => editor?.commands.focus();

  const handlePublish = async () => {
    if (!editor || editor.isEmpty) return;

    const json = editor.getJSON();
    const content = json.content
      ?.map((node: JSONContent) => {
        if (node.type !== "paragraph") return "";
        return node.content
          ?.map((child: JSONContent) => {
            if (child.type === "text") return child.text || "";
            if (child.type === "mention") return `<@${child.attrs?.id}>`;
            return "";
          })
          .join("");
      })
      .join("\n")
      .trim();

    try {
      setIsSubmitting(true);
      await onSubmit(content || "");
      editor.commands.clearContent();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = !editor || !hasContent || isLoading || isSubmitting;

  return (
    <div className="bg-background z-10 shrink-0">
      <div className="flex items-center gap-3">
        <UserAvatar user={author} />

        <div className="bg-background border-foreground/40 relative flex flex-1 items-end gap-4 rounded-xl border px-3 py-2">
          <div className="flex-1 cursor-text" onClick={handleFocus}>
            <EditorContent editor={editor} />
          </div>

          <button
            onClick={handlePublish}
            disabled={isButtonDisabled}
            className="text-primary hover:text-primary/80 mb-0.5 cursor-pointer text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Đang gửi..." : "Đăng"}
          </button>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground text-[12px] font-medium transition-colors"
          >
            Hủy
          </button>
        )}
      </div>
    </div>
  );
};
