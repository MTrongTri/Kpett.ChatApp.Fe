import { UserAvatar } from "@/components/user/user-avatar";
import { formatCompactNumber } from "@/lib/format-number-utils";

interface CurrentUser {
  id: string;
  username: string;
  displayName: string;
  isOnline: boolean;
  role: string;
  posts: number;
  followers: number;
  following: number;
}

const CURRENT_USER: CurrentUser = {
  id: "1",
  username: "tuan.dev",
  displayName: "Tuấn Nguyễn",
  isOnline: true,
  role: "Backend Dev",
  posts: 248,
  followers: 4200,
  following: 891,
};

export default function ProfileCard() {
  return (
    <div className="border-border bg-card mb-1 rounded-xl border p-4">
      {/* Top row */}
      <div className="mb-4 flex items-center gap-3">
        <div>
          <UserAvatar
            user={CURRENT_USER}
            isShowDotOnline={true}
            className="h-12 w-12"
          />
        </div>
        <div>
          <p className="text-card-foreground text-sm leading-tight font-semibold">
            {CURRENT_USER.username}
          </p>
          <p className="text-foreground/40 mt-0.5 text-[11px]">
            @{CURRENT_USER.displayName.toLowerCase().replace(" ", "")} ·{" "}
            {CURRENT_USER.role}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-border grid grid-cols-3 gap-1 border-t pt-3">
        {[
          { n: CURRENT_USER.posts, l: "Bài viết" },
          { n: CURRENT_USER.followers, l: "Theo dõi" },
          { n: CURRENT_USER.following, l: "Đang theo dõi" },
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
