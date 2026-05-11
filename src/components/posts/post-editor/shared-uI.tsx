import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, UploadCloud, X } from "lucide-react";
import { useState } from "react";

// --- TYPES ---

interface ChipProps {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

interface MediaGridProps {
  selected: number | null;
  onSelect: (index: number | null) => void;
}

interface PollBuilderProps {
  options: string[];
  setOptions: (options: string[]) => void;
}

// --- COMPONENTS ---

export function Chip({ label, color, active, onClick }: ChipProps) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className="cursor-pointer px-3 py-1 text-[10px] tracking-widest uppercase transition-all"
      style={
        active
          ? { backgroundColor: color, color: "#fff", borderColor: color }
          : {}
      }
    >
      {label}
    </Badge>
  );
}

export function TagInput({ tags, setTags }: TagInputProps) {
  const [val, setVal] = useState("");

  const add = () => {
    const clean = val.trim().replace(/^#/, "").toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 8) {
      setTags([...tags, clean]);
      setVal("");
    }
  };

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="gap-1 px-2.5 py-1 text-[11px]"
          >
            #{tag}
            <X
              className="hover:text-destructive h-3 w-3 cursor-pointer transition-colors"
              onClick={() => setTags(tags.filter((t2) => t2 !== tag))}
            />
          </Badge>
        ))}
      </div>
      <div className="bg-background border-input focus-within:ring-ring flex items-center gap-2 rounded-xl border px-3 py-1.5 transition-all focus-within:ring-2 focus-within:ring-offset-2">
        <span className="text-muted-foreground">#</span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Thêm thẻ... (Enter để xác nhận)"
          className="text-foreground placeholder:text-muted-foreground flex-1 border-none bg-transparent text-sm outline-none"
        />
        {val && (
          <Button
            size="sm"
            variant="ghost"
            onClick={add}
            className="h-6 px-2 text-[10px] font-bold tracking-wider uppercase"
          >
            <Plus className="mr-1 h-3 w-3" /> Thêm
          </Button>
        )}
      </div>
    </div>
  );
}
