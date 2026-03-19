"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user/user-avatar";
import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";

interface SuggestedUser {
  id: string;
  displayName: string;
  username: string;
  reason: string;
  avatarUrl: string | null;
}

const SUGGESTED_USERS: SuggestedUser[] = [
  {
    id: "1",
    displayName: "Linh Art",
    username: "linh_art",
    reason: "Bạn của minh.photo",
    avatarUrl:
      "https://plus.unsplash.com/premium_photo-1773385056696-58a0b34d8723?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8",
  },
  {
    id: "2",
    displayName: "Khanh Nguyen",
    username: "khanh.moto",
    reason: "Được gợi ý cho bạn",
    avatarUrl: null,
  },
  {
    id: "3",
    displayName: "Van Tran",
    username: "van.foodie",
    reason: "Theo dõi hung.travel",
    avatarUrl: null,
  },
  {
    id: "4",
    displayName: "Phuong Tran",
    username: "phuong_k",
    reason: "Được gợi ý cho bạn",
    avatarUrl: null,
  },
  {
    id: "5",
    displayName: "Bao Tran",
    username: "bao.street",
    reason: "Bạn của nam.design",
    avatarUrl: null,
  },
];

export default function SuggestionsCard() {
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="border-border bg-card space-y-6 rounded-xl border p-4">
      {SUGGESTED_USERS.map((user, i) => {
        const isFollowing = followed.has(user.id);
        return (
          <div key={user.id}>
            <div className="flex items-center gap-2.5">
              <div>
                <UserAvatar user={user} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-card-foreground truncate text-[13px] leading-tight font-semibold">
                  {user.username}
                </p>
                <p className="text-foreground/40 mt-0.5 truncate text-[11px]">
                  Được gợi ý cho bạn
                </p>
              </div>
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                onClick={() => toggle(user.id)}
                className={cn(
                  "h-7 shrink-0 rounded-md px-3 text-[11px] tracking-wider",
                  "transition-all duration-150",
                  isFollowing
                    ? "border-border text-foreground/60 hover:border-destructive hover:text-destructive"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent",
                )}
              >
                {isFollowing ? (
                  <>
                    <X size={10} className="mr-0.5" />
                    Hủy lời mời
                  </>
                ) : (
                  <>
                    <Plus size={10} className="mr-0.5" />
                    Gửi lời mời
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
