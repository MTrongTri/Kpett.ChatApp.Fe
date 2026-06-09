import { UserAvatar } from "@/components/user/user-avatar";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { BaseAuthor } from "@/types/user";
import {
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface PostHeaderProps {
  author: BaseAuthor;
  postCreatedAt: string;
}

export function PostHeader({ author, postCreatedAt }: PostHeaderProps) {
  console.log("Rendering PostHeader for author:", author);
  return (
    <div className="flex shrink-0 items-center gap-2.5 py-3">
      <Link href={`/${author.username}`} className="shrink-0">
        <UserAvatar user={author} />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-card-foreground truncate text-[13px] font-semibold">
              <Link href={`/${author.username}`} className="shrink-0">
                {author.displayName}
              </Link>
            </span>
            {author.isVerified && (
              <CheckCircle2 size={13} className="text-primary shrink-0" />
            )}
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
