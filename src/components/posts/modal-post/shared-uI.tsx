import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { MEDIA_PLACEHOLDERS, POLL_PLACEHOLDERS } from "@/data/modal-post";

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

export function MediaGrid({ selected, onSelect }: MediaGridProps) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {MEDIA_PLACEHOLDERS.map((m, i) => {
          const isSel = selected === i;
          return (
            <div
              key={i}
              onClick={() => onSelect(isSel ? null : i)}
              className={`relative aspect-video cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-150 ${isSel
                  ? "border-primary ring-primary ring-offset-background ring-2 ring-offset-2"
                  : "hover:border-primary/50 border-transparent"
                }`}
              style={{ background: m.bg }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                {m.e}
              </div>
              {isSel && (
                <div className="bg-primary text-primary-foreground absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full shadow-md">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Button
        variant="outline"
        className="text-muted-foreground mt-3 h-11 w-full border-dashed"
      >
        <UploadCloud className="mr-2 h-4 w-4" /> Tải ảnh / video từ thiết bị
      </Button>
    </div>
  );
}

export function PollBuilder({ options, setOptions }: PollBuilderProps) {
  const add = () => options.length < 4 && setOptions([...options, ""]);
  const update = (i: number, v: string) =>
    setOptions(options.map((o, j) => (j === i ? v : o)));
  const remove = (i: number) =>
    options.length > 2 && setOptions(options.filter((_, j) => j !== i));

  const [days, setDays] = useState<number>(3);

  return (
    <div className="bg-secondary/40 rounded-xl border p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
          📊 Lựa chọn bình chọn
        </span>
        <span className="text-muted-foreground text-[10px]">
          {options.length}/4
        </span>
      </div>
      <div className="mb-3 flex flex-col gap-2.5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md p-0"
            >
              {i + 1}
            </Badge>
            <Input
              value={opt}
              onChange={(e) => update(i, e.target.value)}
              placeholder={POLL_PLACEHOLDERS[i] || `Lựa chọn ${i + 1}`}
              className="bg-background flex-1"
            />
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      {options.length < 4 && (
        <Button
          variant="outline"
          onClick={add}
          className="text-muted-foreground w-full border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" /> Thêm lựa chọn
        </Button>
      )}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-muted-foreground text-[11px]">Thời gian:</span>
        {[1, 3, 7].map((d) => (
          <Button
            key={d}
            variant={days === d ? "default" : "outline"}
            size="sm"
            onClick={() => setDays(d)}
            className="h-7 text-xs"
          >
            {d} ngày
          </Button>
        ))}
      </div>
    </div>
  );
}
