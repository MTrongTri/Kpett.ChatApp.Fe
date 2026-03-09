import { Search } from "lucide-react";
import { Input } from "../../ui/input";

export default function SearchBar() {
  return (
    <div className="
      hidden lg:flex items-center gap-2
      bg-zinc-800 border border-zinc-700 rounded-lg
      px-3 py-1.5 mx-4
      focus-within:border-amber-400/60 transition-colors
      w-[200px]
    ">
      <Search size={13} className="text-zinc-500 flex-shrink-0" />
      <Input
        type="text"
        placeholder="Tìm kiếm..."
        className="
          bg-transparent border-none shadow-none outline-none p-0 h-auto
          text-[12px] text-zinc-200 placeholder:text-zinc-600
          focus-visible:ring-0 focus-visible:ring-offset-0
          w-full
        "
      />
    </div>
  );
}