"use client";

import { cn } from "@/lib/utils";

interface ColorPickerProps {
  /** Array of Tailwind gradient class strings, e.g. "from-emerald-400 to-teal-500" */
  options:    string[];
  value:      string;
  onChange:   (gradient: string) => void;
  /** Render each swatch as a square (cover) or a circle with initial letter (avatar) */
  variant?:   "cover" | "avatar";
  initial?:   string;
}

export default function ColorPicker({
  options,
  value,
  onChange,
  variant = "cover",
  initial = "?",
}: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((gradient) => {
        const active = value === gradient;

        if (variant === "avatar") {
          return (
            <button
              key={gradient}
              type="button"
              onClick={() => onChange(gradient)}
              className={cn(
                "h-10 w-10 rounded-full shrink-0",
                "bg-gradient-to-br flex items-center justify-center",
                "font-bold text-[15px] text-white",
                "transition-all duration-150",
                "border-2",
                gradient,
                active
                  ? "border-primary"
                  : "border-transparent hover:border-white/30"
              )}
            >
              {initial}
            </button>
          );
        }

        return (
          <button
            key={gradient}
            type="button"
            onClick={() => onChange(gradient)}
            className={cn(
              "h-8 w-12 rounded-[8px] flex-shrink-0",
              "bg-gradient-to-br",
              "transition-all duration-150",
              "border-2",
              gradient,
              active
                ? "border-primary shadow-[0_0_0_1px_theme(colors.primary)]"
                : "border-transparent hover:border-white/25"
            )}
          />
        );
      })}
    </div>
  );
}