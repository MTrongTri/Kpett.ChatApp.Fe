import { cn } from "@/lib/utils";
import type { OnlineStatus } from "@/types/chat";

interface ChatAvatarProps {
  initial: string;
  gradient: string; // Tailwind gradient classes
  size?: number; // px
  radius?: number; // px
  status?: OnlineStatus;
  /** Border color of the online dot — pass the CSS background color of the parent */
  borderColor?: string;
}

const STATUS_COLOR: Record<OnlineStatus, string | null> = {
  online: "bg-emerald-500",
  away: "bg-amber-400",
  offline: null,
};

export default function ChatAvatar({
  initial,
  gradient,
  size = 38,
  radius = 10,
  status,
  borderColor = "var(--color-card)",
}: ChatAvatarProps) {
  const dotColor = status ? STATUS_COLOR[status] : null;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* Avatar body */}
      <div
        className={cn(
          "flex items-center justify-center",
          "font-bold text-white bg-gradient-to-br select-none",
          gradient,
        )}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          fontSize: size * 0.36,
        }}
      >
        {initial}
      </div>

      {/* Status dot */}
      {dotColor && (
        <span
          className={cn(
            "absolute -bottom-[1px] -right-[1px]",
            "rounded-full border-2",
            dotColor,
          )}
          style={{
            width: Math.round(size * 0.3),
            height: Math.round(size * 0.3),
            borderColor,
          }}
        />
      )}
    </div>
  );
}
