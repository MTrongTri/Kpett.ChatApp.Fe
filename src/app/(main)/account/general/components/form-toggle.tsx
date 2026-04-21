"use client";

import { cn } from "@/lib/utils";

interface FormToggleProps {
  checked:   boolean;
  onChange:  (value: boolean) => void;
  disabled?: boolean;
  label?:    string; // screen-reader label
}

export default function FormToggle({
  checked,
  onChange,
  disabled = false,
  label,
}: FormToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full",
        "border-2 border-transparent",
        "transition-colors duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-foreground/15",
        disabled && "opacity-40 cursor-not-allowed",
        !disabled && "cursor-pointer"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white",
          "shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
          "transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}