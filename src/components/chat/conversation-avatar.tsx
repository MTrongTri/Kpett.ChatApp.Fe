"use client";

import { getAvatarGradient } from "@/lib/avatar-utils";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary-utils";
import { cn } from "@/lib/utils";
import { ConversationResponse, ParticipantResponse } from "@/types/chat";
import Image from "next/image";
import { useAuth } from "../providers/auth-provider";
import { UserAvatar } from "../user/user-avatar";
import Link from "next/link";

interface ConversationAvatarProps {
    conversation: ConversationResponse;
    className?: string;
    isShowDotOnline?: boolean;
    dotClassName?: string;
}

// Component phụ để render từng mảnh (lát cắt) của avatar ghép
const MiniAvatar = ({ user, className }: { user: ParticipantResponse; className?: string }) => {
    const char = user.displayName?.charAt(0) || user.username?.charAt(0) || "?";

    return (
        <div
            className={cn(
                "relative flex h-full w-full items-center justify-center overflow-hidden text-white font-bold",
                !user.avatarUrl && "bg-linear-to-br",
                !user.avatarUrl && getAvatarGradient(user.id),
                className
            )}
        >
            {user.avatarUrl ? (
                <Image
                    src={getOptimizedCloudinaryUrl(user.avatarUrl, "image")}
                    alt={user.displayName}
                    fill
                    sizes="50vw"
                    className="object-cover"
                />
            ) : (
                <span className="text-[10px] sm:text-xs">{char.toUpperCase()}</span>
            )}
        </div>
    );
};

export function ConversationAvatar({
    conversation,
    className = "w-10 h-10",
    isShowDotOnline = false,
    dotClassName,
}: ConversationAvatarProps) {
    const { user } = useAuth();

    const participants = conversation.participants || [];

    // Nếu là Chat 1-1 (Direct) hoặc Group rỗng/chỉ có 1 người
    if (conversation.type === "Direct") {
        const displayUser = participants.find(p => p.id != user?.id);
        if (!displayUser) return <div className={cn("bg-muted rounded-full", className)} />;

        return (
            <UserAvatar
                user={{
                    id: displayUser.id,
                    displayName: displayUser.displayName || displayUser.username,
                    avatarUrl: displayUser.avatarUrl,
                    isOnline: displayUser.isOnline
                }}
                isShowDotOnline={isShowDotOnline}
                className={className}
                dotClassName={dotClassName}
            />
        );
    }

    // Nếu Group có set ảnh đại diện riêng -> Dùng ảnh đó luôn
    if (conversation.avatarUrl) {
        return (
            <UserAvatar
                user={{
                    id: conversation.id,
                    displayName: conversation.name || "Group",
                    avatarUrl: conversation.avatarUrl,
                    isOnline: participants.filter((p) => p.id != user?.id).some(p => p.isOnline)
                }}
                isShowDotOnline={isShowDotOnline}
                className={className}
                dotClassName={dotClassName}
            />
        );
    }

    // Nếu là Chat Nhóm (Group) -> Tạo Avatar ghép (Tối đa 4 người)
    const members = participants.slice(0, 4);
    const isAnyOnline = participants.some((m) => m.isOnline);

    return (
        <div className={cn("relative inline-flex shrink-0", className)}>
            {/* Vùng chứa Avatar (Xóa overflow-hidden và border tổng để các ảnh con tự bo tròn) */}
            <div className="relative w-full h-full bg-transparent">

                {/* Nhóm 2 người: Đè chéo (Góc trên phải & Góc dưới trái) */}
                {members.length === 2 && (
                    <>
                        <MiniAvatar
                            user={members[0]}
                            className="absolute top-0 right-0 w-[68%] h-[68%] rounded-full shadow-sm"
                        />
                        <MiniAvatar
                            user={members[1]}
                            className="absolute bottom-0 left-0 w-[68%] h-[68%] rounded-full border-2 border-background shadow-sm z-10"
                        />
                    </>
                )}

                {/* Nhóm 3 người: 1 trên giữa, 2 dưới 2 bên */}
                {members.length === 3 && (
                    <>
                        <MiniAvatar
                            user={members[0]}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-[55%] rounded-full shadow-sm"
                        />
                        <MiniAvatar
                            user={members[1]}
                            className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-full border-2 border-background shadow-sm z-10"
                        />
                        <MiniAvatar
                            user={members[2]}
                            className="absolute bottom-0 right-0 w-[55%] h-[55%] rounded-full border-2 border-background shadow-sm z-10"
                        />
                    </>
                )}

                {/* Nhóm 4 người: 4 góc đè lên nhau */}
                {members.length >= 4 && (
                    <>
                        <MiniAvatar
                            user={members[0]}
                            className="absolute top-0 left-0 w-[52%] h-[52%] rounded-full shadow-sm"
                        />
                        <MiniAvatar
                            user={members[1]}
                            className="absolute top-0 right-0 w-[52%] h-[52%] rounded-full border-[1.5px] border-background shadow-sm z-10"
                        />
                        <MiniAvatar
                            user={members[2]}
                            className="absolute bottom-0 left-0 w-[52%] h-[52%] rounded-full border-[1.5px] border-background shadow-sm z-10"
                        />
                        <MiniAvatar
                            user={members[3]}
                            className="absolute bottom-0 right-0 w-[52%] h-[52%] rounded-full border-[1.5px] border-background shadow-sm z-20"
                        />
                    </>
                )}
            </div>

            {/* Dấu chấm Online của cả Group */}
            {isShowDotOnline && isAnyOnline && (
                <span
                    className={cn(
                        "absolute right-0 bottom-0 z-30 block h-3 w-3 rounded-full border-2",
                        "border-background bg-emerald-500",
                        dotClassName
                    )}
                />
            )}
        </div>
    );
}