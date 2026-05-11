import { cn } from "@/lib/utils";
import Link from "next/link";

function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("text-primary flex shrink-0 items-center justify-center font-serif text-[26px] leading-none font-black tracking-tighter italic transition-opacity select-none", className)}
    >
      K
      <span className="font-light text-zinc-900 not-italic transition-colors duration-300 dark:text-zinc-100">
        PET
      </span>
    </Link>
  );
}

export default Logo;
