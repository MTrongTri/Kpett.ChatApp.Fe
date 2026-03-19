import { MOCK_USER_PROFILES } from "@/data/user";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import {
  useEditor,
  EditorContent,
  ReactRenderer,
  JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { ScrollArea } from "../ui/scroll-area";
import { BaseAuthor } from "@/types/user";
import { UserAvatar } from "../user/user-avatar";

//
// =======================
// Utils
// =======================
const getMentionItems = (query: string) => {
  return MOCK_USER_PROFILES.filter(
    (item) =>
      item.displayName.toLowerCase().includes(query.toLowerCase()) ||
      item.username.toLowerCase().includes(query.toLowerCase()),
  ).slice(0, 5);
};

//
// =======================
// Mention List
// =======================
const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.displayName });
    }
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex(
          (prev) => (prev + props.items.length - 1) % props.items.length,
        );
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % props.items.length);
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  if (!props.items.length) return null;

  return (
    <ScrollArea
      className="bg-background border-border pointer-events-auto z-50 h-48 w-64 rounded-md border shadow-md"
      onWheel={(e) => e.stopPropagation()}
    >
      {props.items.map((item: any, index: number) => (
        <button
          key={item.id}
          type="button"
          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
            index === selectedIndex
              ? "bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <img
            src={item.avatarUrl || "https://github.com/shadcn.png"}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="leading-none font-semibold text-gray-900 dark:text-gray-100">
              {item.displayName}
            </span>
            <span className="mt-1 text-xs text-gray-500">@{item.username}</span>
          </div>
        </button>
      ))}
    </ScrollArea>
  );
});
MentionList.displayName = "MentionList";

//
// =======================
// Main Component
// =======================
interface CommentInputProps {
  author: BaseAuthor;
}

export const CommentInput = ({ author }: CommentInputProps) => {
  const [hasContent, setHasContent] = useState(false);

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
          items: ({ query }) => getMentionItems(query),

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
                        options: {
                          boundary: "viewport",
                        },
                      },
                    ],
                  },
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
    if (!editor) return;

    const update = () => {
      setHasContent(!editor.isEmpty);
    };

    // chạy lần đầu
    update();

    editor.on("update", update);

    return () => {
      editor.off("update", update);
    };
  }, [editor]);

  const handleFocus = () => editor?.commands.focus();

  const handleSubmit = () => {
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

    console.log("DỮ LIỆU GỬI LÊN API:", content);

    editor.commands.clearContent();
  };

  return (
    <div className="border-border/50 bg-background z-10 shrink-0 border-t pt-6">
      <div className="flex items-center gap-3">
        <UserAvatar user={author} />

        <div className="bg-background border-foreground/40 relative flex flex-1 items-end gap-4 rounded-xl border px-3 py-2">
          <div className="flex-1 cursor-text" onClick={handleFocus}>
            <EditorContent editor={editor} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!editor || !hasContent}
            className="text-primary hover:text-primary/80 mb-0.5 cursor-pointer text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Đăng
          </button>
        </div>
      </div>
    </div>
  );
};
