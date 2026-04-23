import { Button } from "@/components/ui/button";
import { openPostEditorModal } from "@/store/features/modal-slice";
import { RootState } from "@/store/store";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

export default function ComposeButton() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const handleOpenPostEditor = () => {
    dispatch(openPostEditorModal({ mode: "create", postId: null }));
  };

  if (!currentUser) {
    return (
      <div>
        <Link
          href="/login"
          className="ml-1 hidden h-9 cursor-pointer items-center gap-1.5 rounded-full border-none bg-amber-400 px-5 text-[11px] font-semibold tracking-wider text-zinc-900 uppercase transition-all duration-150 hover:-translate-y-px hover:bg-amber-300 hover:shadow-[0_4px_14px_rgba(251,191,36,0.35)] sm:flex"
        >
          Đăng nhập
        </Link>

      </div >
    );
  }

  return (
    <div>
      <Button
        onClick={handleOpenPostEditor}
        className="ml-1 hidden h-9 cursor-pointer items-center gap-1.5 rounded-full border-none bg-amber-400 px-5 text-[11px] font-semibold tracking-wider text-zinc-900 uppercase transition-all duration-150 hover:-translate-y-px hover:bg-amber-300 hover:shadow-[0_4px_14px_rgba(251,191,36,0.35)] sm:flex"
      >
        Tạo bài
      </Button>
    </div>
  );
}
