import { UserAvatar } from "@/components/user/user-avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { SpotlightUser } from "./spotlight-strip";

export default function SpotlightItem({ user }: { user: SpotlightUser }) {
  return (
    <div className="group flex shrink-0 cursor-pointer flex-col items-center gap-2">
      <div
        className={cn(
          "relative h-27.5 w-20 overflow-hidden rounded-lg",
          "transition-all duration-200",
          "group-hover:shadow-lg group-hover:shadow-black/20",
        )}
      >
        {/* Background */}
        <div className="h-full w-full">
          <Image
            fill
            className="object-cover"
            alt="story"
            src="https://images.unsplash.com/photo-1773002026337-00a7b135fa5f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMHx8fGVufDB8fHx8fA%3D%3D"
          />
        </div>

        {/* Avatar badge */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <UserAvatar user={user} className="h-8 w-8" />
        </div>
      </div>

      <span className="text-foreground/50 max-w-20 truncate text-center text-[10px] font-semibold">
        {user.username}
      </span>
    </div>
  );
}
