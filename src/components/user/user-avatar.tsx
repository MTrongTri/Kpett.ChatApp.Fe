import { getAvatarGradient } from "@/lib/avatar-utils";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary-utils";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface User {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
}

interface UserAvatarProps {
  user: User;
  isShowDotOnline?: boolean;
  className?: string;
  initialClassName?: string;
  dotClassName?: string;
}

export function UserAvatar({
  user,
  isShowDotOnline,
  className,
  initialClassName,
  dotClassName,
}: UserAvatarProps) {
  const charFirst =
    user.displayName?.charAt(0) || user.username?.charAt(0) || "?";
  const initial = charFirst.toUpperCase();

  return (
    <div className={cn("relative inline-flex shrink-0", "h-9 w-9", className)}>
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white",
          "border border-border/50 shadow-xs",
          !user.avatarUrl && "bg-linear-to-br",
          !user.avatarUrl && getAvatarGradient(user.id),
        )}
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl ? getOptimizedCloudinaryUrl(user.avatarUrl, "image") : ""}
            alt={`Avatar of ${user.displayName || "user"}`}
            fill
            className="object-cover"
          />
        ) : (
          <span className={cn(initialClassName)}>{initial}</span>
        )}
      </div>

      {isShowDotOnline && (
        <span
          className={cn(
            "absolute right-0 bottom-0 z-10 block h-3 w-3 rounded-full border-2",
            "border-background",
            user.isOnline ? "bg-emerald-500" : "bg-muted-foreground",
            dotClassName,
          )}
        />
      )}
    </div>
  );
}