import { Button } from "@/components/ui/button";
import { openModal } from "@/store/features/modalSlice";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";

export default function ComposeButton() {

  const dispatch = useDispatch();

  return (
    <Button
      className="
        hidden sm:flex items-center gap-1.5
        bg-amber-400 text-zinc-900 text-[11px] font-semibold
        tracking-wider uppercase px-3.5 h-9 rounded-md
        hover:bg-amber-300 hover:shadow-[0_4px_14px_rgba(251,191,36,0.35)]
        hover:-translate-y-px
        transition-all duration-150 ml-1
        border-none
      "
      onClick={() => dispatch(openModal("create_post"))}
    >
      <Plus size={14} strokeWidth={2.5} />
      Tạo bài
    </Button>
  );
}