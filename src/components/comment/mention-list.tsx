import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

export interface MentionUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
}

const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.username });
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

  return (
    <ScrollArea
      className="bg-background border-border pointer-events-auto z-50 w-64 rounded-md border shadow-md *:data-radix-scroll-area-viewport:max-h-48"
      onWheel={(e) => e.stopPropagation()}
    >
      {!props.items.length ? (
        <div className="p-3 text-center text-sm text-gray-500">
          Không tìm thấy kết quả...
        </div>
      ) : (
        props.items.map((item: MentionUser, index: number) => (
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
                {item.username}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                {item.displayName}
              </span>
            </div>
          </button>
        ))
      )}
    </ScrollArea>
  );
});

MentionList.displayName = "MentionList";

export default MentionList;
