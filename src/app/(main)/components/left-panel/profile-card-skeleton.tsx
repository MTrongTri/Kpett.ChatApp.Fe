export function ProfileCardSkeleton() {
  return (
    <div className="border-border bg-card mb-1 rounded-xl border p-4">
      {/* Top row Skeleton */}
      <div className="mb-4 flex items-center gap-3">
        {/* Avatar Skeleton */}
        <div className="bg-muted h-12 w-12 animate-pulse rounded-full" />

        {/* Text Info Skeleton */}
        <div className="flex flex-col gap-1.5">
          {/* Display Name Box */}
          <div className="bg-muted h-4 w-32 animate-pulse rounded-md" />
          {/* Username Box */}
          <div className="bg-muted h-3 w-20 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="border-border grid grid-cols-3 gap-1 border-t pt-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex flex-col items-center text-center">
            {/* Stat Number Box */}
            <div className="bg-muted mb-1 h-5 w-12 animate-pulse rounded-md" />
            {/* Stat Label Box */}
            <div className="bg-muted h-3 w-16 animate-pulse rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
