import { UserAvatar } from "@/components/user/user-avatar";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { BaseAuthor } from "@/types/user";
import {
  CheckCircle2, Users
} from "lucide-react";
import Link from "next/link";

interface PostHeaderProps {
  author: BaseAuthor;
  postCreatedAt: string;
  group?: { id: string; name: string | null; avatarUrl: string | null; privacy: string | null } | null;
}

export function PostHeader({ author, postCreatedAt, group }: PostHeaderProps) {
  return (
    <div className="flex shrink-0 items-start gap-2.5 py-3">
      <Link href={group ? `/groups/${group.id}` : `/${author.username}`} className="shrink-0 mt-0.5 relative">
        {group && group.avatarUrl ? (
           <img src={group.avatarUrl} alt={group.name || "Group"} className="w-10 h-10 rounded-xl object-cover" />
        ) : group ? (
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
             {group.name ? group.name.charAt(0).toUpperCase() : "G"}
           </div>
        ) : (
           <UserAvatar user={author} className="w-10 h-10" />
        )}
        {group && (
          <div className="absolute -bottom-1 -right-1 ring-2 ring-card rounded-full bg-card">
            <UserAvatar user={author} className="w-5 h-5" />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="gap-1.5">
          <div className="flex items-center flex-wrap gap-1 leading-tight">
            {group ? (
               <>
                 <span className="text-card-foreground truncate text-[14px] font-bold">
                   <Link href={`/groups/${group.id}`} className="hover:underline">
                     {group.name || "Nhóm"}
                   </Link>
                 </span>
                 <span className="text-muted-foreground text-[13px] px-0.5">
                    đăng bởi
                 </span>
                 <span className="text-card-foreground truncate text-[13px] font-semibold">
                   <Link href={`/${author.username}`} className="hover:underline">
                     {author.displayName}
                   </Link>
                 </span>
               </>
            ) : (
               <>
                 <span className="text-card-foreground truncate text-[14px] font-bold">
                   <Link href={`/${author.username}`} className="hover:underline">
                     {author.displayName}
                   </Link>
                 </span>
                 {author.isVerified && (
                   <CheckCircle2 size={13} className="text-primary shrink-0" />
                 )}
               </>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="font-roboto text-muted-foreground text-[11.5px]">
              {formatRelativeTime(postCreatedAt)}
            </span>
            {group && group.privacy && (
              <>
                 <span className="text-muted-foreground/50 text-[10px]">•</span>
                 <span className="text-muted-foreground text-[11.5px] flex items-center gap-1">
                   <Users size={11} className="opacity-70" />
                   {group.privacy === "public" ? "Nhóm công khai" : "Nhóm kín"}
                 </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
