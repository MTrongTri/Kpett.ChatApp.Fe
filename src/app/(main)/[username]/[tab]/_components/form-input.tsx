"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ── TEXT INPUT ────────────────────────────────────────────────────────
interface FormInputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode; 
  suffix?: React.ReactNode;
}

export function FormInput({
  className,
  prefix,
  suffix,
  ...props
}: FormInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        "bg-background border rounded-[10px]",
        "px-3 py-[9px]",
        "transition-all duration-150",
        focused
          ? "border-primary/50 shadow-[0_0_0_3px_rgba(245,158,11,0.1)]"
          : "border-border",
        className
      )}
    >
      {prefix && (
        <span className=" text-[13px] text-foreground/40 flex-shrink-0 select-none">
          {prefix}
        </span>
      )}
      <input
        {...props}
        onFocus={(e) => { setFocused(true);  props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e);  }}
        className="
          flex-1 bg-transparent border-none outline-none
          text-[14px] text-foreground placeholder:text-foreground/30
          font-[inherit] min-w-0
        "
      />
      {suffix && (
        <span className="flex-shrink-0">{suffix}</span>
      )}
    </div>
  );
}

// ── TEXTAREA ─────────────────────────────────────────────────────────
interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
}

export function FormTextarea({
  className,
  maxLength,
  value,
  ...props
}: FormTextareaProps) {
  const [focused, setFocused] = useState(false);
  const len = String(value ?? "").length;
  const near = maxLength ? len > maxLength * 0.9 : false;

  return (
    <div className="relative">
      <textarea
        {...props}
        value={value}
        maxLength={maxLength}
        onFocus={(e) => { setFocused(true);  props.onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e);  }}
        className={cn(
          "w-full bg-background border rounded-[10px]",
          "px-3 py-[9px] resize-y min-h-[90px]",
          "text-[14px] text-foreground placeholder:text-foreground/30",
          "font-[inherit] outline-none",
          "transition-all duration-150",
          focused
            ? "border-primary/50 shadow-[0_0_0_3px_rgba(245,158,11,0.1)]"
            : "border-border",
          className
        )}
      />
      {maxLength && (
        <span
          className={cn(
            "absolute bottom-2.5 right-3",
            " text-[10px] pointer-events-none select-none",
            near ? "text-primary" : "text-foreground/30"
          )}
        >
          {len}/{maxLength}
        </span>
      )}
    </div>
  );
}