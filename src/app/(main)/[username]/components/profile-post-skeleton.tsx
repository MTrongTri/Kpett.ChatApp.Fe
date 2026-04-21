import { cn } from "@/lib/utils";

interface ProfilePostsSkeletonProps {
  count?: number;
}

export default function ProfilePostsSkeleton({
  count = 6,
}: ProfilePostsSkeletonProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "relative aspect-square w-full overflow-hidden rounded-xl",
            "bg-muted border-border/50 animate-pulse border",
          )}
        >
          <div className="absolute top-2 left-2 flex gap-1">
            <div className="bg-foreground/10 h-6 w-6 rounded-md" />
          </div>

          <div className="flex h-full w-full items-center justify-center">
            <div className="bg-foreground/5 h-1/3 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
