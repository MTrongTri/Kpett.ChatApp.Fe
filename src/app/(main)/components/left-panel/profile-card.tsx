import { UserAvatar } from "@/components/user/user-avatar";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { getMyStats } from "@/services/user.service";
import Link from "next/link";
import useSWR from "swr";
import { ProfileCardSkeleton } from "./profile-card-skeleton";

export default function ProfileCard() {
  const {
    data: response,
    isLoading,
    error,
  } = useSWR(["/user/me/stats"], () => getMyStats());

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  if (error || !response?.data) {
    return null;
  }

  const userStats = response.data;

  return (
    <div className="border-border bg-card mb-1 rounded-xl border p-4">
      {/* Top row */}
      <Link href={userStats.username}>
        <div className="mb-4 flex items-center gap-3">
          <div>
            <UserAvatar user={userStats} className="h-12 w-12" />
          </div>
          <div>
            <p className="text-card-foreground text-sm leading-tight font-semibold">
              {userStats.displayName}
            </p>
            <p className="text-foreground/40 mt-0.5 text-[11px]">
              @{userStats.username.toLowerCase().replace(" ", "")}
            </p>
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div className="border-border grid grid-cols-3 gap-1 border-t pt-3">
        {[
          { n: userStats.totalPosts, l: "Bài viết" },
          { n: userStats.followers, l: "Theo dõi" },
          { n: userStats.following, l: "Đang theo dõi" },
        ].map((s) => (
          <div key={s.l} className="text-center">
            <p className="text-card-foreground text-[18px] leading-tight font-bold">
              {formatCompactNumber(s.n)}
            </p>
            <p className="text-foreground/40 mt-0.5 text-[10px]">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
