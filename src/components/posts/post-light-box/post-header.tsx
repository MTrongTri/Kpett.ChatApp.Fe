import { UserAvatar } from "@/components/user/user-avatar";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { BaseAuthor } from "@/types/user";
import {
  BadgeCheck,
  CheckCircle,
  CheckCircle2,
  CheckCircle2Icon,
  LucideCheckCircle,
} from "lucide-react";

interface PostHeaderProps {
  author: BaseAuthor;
  postCreatedAt: string;
}

export function PostHeader({ author, postCreatedAt }: PostHeaderProps) {
  return (
    <div className="border-border flex shrink-0 items-center gap-2.5 border-b py-3">
      <UserAvatar user={author} />
      <div className="min-w-0 flex-1">
        <div className="gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-card-foreground truncate text-[13px] font-semibold">
              {author.username}
            </span>
            {author.isVerified && (
              <CheckCircle2 size={13} className="text-primary shrink-0" />
            )}

            <button className="text-primary hover:text-primary/75 shrink-0 cursor-pointer text-[10px] font-semibold transition-colors">
              Theo dỗi
            </button>
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="font-roboto text-foreground/40 text-[11px]">
              {formatRelativeTime(postCreatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
