import { UserAvatar } from "@/components/user/user-avatar";
import { cn } from "@/lib/utils";

interface OnlineFriend {
  id: string;
  displayName: string;
  username: string;
  status: string;
  isOnline: boolean;
  avatarUrl: string | null;
}

const ONLINE_FRIENDS: OnlineFriend[] = [
  {
    id: "1",
    displayName: "Minh Trần",
    username: "minh.photo",
    status: "Đang hoạt động",
    isOnline: true,
    avatarUrl: null,
  },
  {
    id: "2",
    displayName: "Hung Nguyen",
    username: "hung.travel",
    status: "Đang hoạt động",
    isOnline: true,
    avatarUrl: null,
  },
  {
    id: "3",
    displayName: "Linh Tran",
    username: "linh_art",
    status: "3 giờ trước",
    isOnline: false,
    avatarUrl: null,
  },
  {
    id: "4",
    displayName: "Khanh Nguyen",
    username: "khanh.moto",
    status: "1 ngày trước",
    isOnline: false,
    avatarUrl: null,
  },
];

export default function OnlineFriends() {
  return (
    <div className="space-y-0.5">
      {ONLINE_FRIENDS.map((friend) => (
        <button
          key={friend.id}
          className="hover:bg-foreground/5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150"
        >
          {/* Avatar with status dot */}
          <div>
            <UserAvatar user={friend} isShowDotOnline={true} />
          </div>
          <div className="min-w-0">
            <p className="text-card-foreground truncate text-[12.5px] leading-tight font-medium">
              {friend.username}
            </p>
            <p
              className={cn(
                "mt-0.5 text-[10px]",
                friend.isOnline ? "text-emerald-500" : "text-foreground/40",
              )}
            >
              {friend.status}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
