import { UserAvatar } from "@/components/user/user-avatar";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { getMyStats } from "@/services/user.service";
import Link from "next/link";
import useSWR from "swr";
import { ProfileCardSkeleton } from "./profile-card-skeleton";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function ProfileCard() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const {
    data: response,
    isLoading,
    error,
  } = useSWR(currentUser ? ["/user/me/stats"] : null, () => getMyStats());

  if (isLoading) {
    return <ProfileCardSkeleton />;
  }

  if (!currentUser) {
    return (
      <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border p-5 text-center">
        {/* Placeholder Avatar/Icon */}
        <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-foreground/40 h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        {/* Lời kêu gọi */}
        <p className="text-card-foreground mb-1 text-sm font-bold">
          Tham gia cộng đồng
        </p>
        <p className="text-foreground/60 mb-4 text-[12px] leading-relaxed">
          Đăng nhập để chia sẻ bài viết, tùy chỉnh hồ sơ và kết nối với mọi người.
        </p>

        {/* Nút thao tác */}
        <div className="flex w-full flex-col gap-2">
          <Link
            href="/login"
            className="bg-primary text-primary-foreground hover:opacity-90 flex w-full items-center justify-center rounded-lg py-2 text-sm font-semibold transition-opacity"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="border-border text-foreground hover:bg-muted flex w-full items-center justify-center rounded-lg border py-2 text-sm font-semibold transition-colors"
          >
            Tạo tài khoản
          </Link>
        </div>
      </div>
    );
  }

  if (error || !response?.data) {
    return null;
  }

  const userStats = response.data;

  return (
    <div className="border-border bg-card rounded-xl border p-4">
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
