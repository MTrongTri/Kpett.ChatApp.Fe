import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";

export default function ComposeButton() {
  return (
    <Button className="ml-1 hidden h-9 items-center gap-1.5 rounded-md border-none bg-amber-400 px-3.5 text-[11px] font-semibold tracking-wider text-zinc-900 uppercase transition-all duration-150 hover:-translate-y-px hover:bg-amber-300 hover:shadow-[0_4px_14px_rgba(251,191,36,0.35)] sm:flex">
      <Plus size={14} strokeWidth={2.5} />
      Tạo bài
    </Button>
  );
}
