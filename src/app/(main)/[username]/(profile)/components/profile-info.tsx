"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatRelativeTime } from "@/lib/format-date-utils";
import { formatCompactNumber } from "@/lib/format-number-utils";
import { friendRequest, friendRequestAccept, friendRequestCancel, friendRequestDecline, unFriend } from "@/services/friend.service";
import { RootState } from "@/store/store";
import { ProfileViewerContext, UserProfile } from "@/types/user";
import {
  Ban,
  BellOff,
  Calendar,
  Check,
  Copy,
  Flag,
  Link2,
  Loader2,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  UserCheck,
  UserMinus,
  UserPlus,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// ── STAT BUTTON ───────────────────────────────────────────────────────
function StatButton({ value, label }: { value: number; label: string }) {
  return (
    <button className="group hover:bg-background/80 flex w-full cursor-pointer flex-col items-center gap-1 rounded-2xl border-none bg-transparent px-2 py-3 transition-all md:px-4">
      <span className="text-foreground group-hover:text-primary text-xl font-bold tracking-tight transition-colors md:text-[22px]">
        {formatCompactNumber(value)}
      </span>
      <span className="text-foreground/50 text-[10px] font-medium tracking-wider uppercase md:text-[11px]">
        {label}
      </span>
    </button>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
interface ProfileInfoProps {
  profile: UserProfile;
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  const [ctx, setCtx] = useState<ProfileViewerContext>(profile.viewerContext);
  const [isLoading, setIsLoading] = useState(false);

  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // ── API HANDLERS ────────────────────────────────────────────────────

  const handleAddFriend = async () => {
    if (!currentUser) {
      toast.warning("Bạn cần đăng nhập để thực hiện gửi lời mời kết bạn");
      return;
    }

    try {
      setIsLoading(true);

      const { data } = await friendRequest(profile.id);

      if (!data) {
        toast.error("Đã có lỗi xảy ra, không nhận được phản hồi");
        return;
      }

      setCtx(prev => ({ ...prev, relationshipRequestId: data.requestId, hasSentFriendRequest: true, isFollowing: true }));
      toast.success("Đã gửi lời mời kết bạn");

    } catch (error) {
      toast.error("Đã có lỗi xảy ra trong quá trình gửi yêu cầu");
      console.error("[handleAddFriend] Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setIsLoading(true);
    try {
      if (!profile.viewerContext.relationshipRequestId) {
        toast.error("Đã có lỗi xảy ra");
        return;
      }

      await friendRequestCancel(profile.viewerContext.relationshipRequestId);

      setCtx(prev => ({ ...prev, hasSentFriendRequest: false, relationshipRequestId: null }));
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setIsLoading(true);
    try {
      if (!profile.viewerContext.relationshipRequestId) {
        toast.error("Đã có lỗi xảy ra");
        return;
      }

      await friendRequestAccept(profile.viewerContext.relationshipRequestId);
      setCtx(prev => ({
        ...prev,
        hasReceivedFriendRequest: false,
        isFriend: true,
        isFollowing: true
      }));
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    setIsLoading(true);
    try {

      if (!profile.viewerContext.relationshipRequestId) {
        toast.error("Đã có lỗi xảy ra");
        return;
      }

      await friendRequestDecline(profile.viewerContext.relationshipRequestId);

      setCtx(prev => ({ ...prev, hasReceivedFriendRequest: false, relationshipRequestId: null }));
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async () => {
    setIsLoading(true);
    try {
      await unFriend(profile.id);
      setCtx(prev => ({ ...prev, isFriend: false, isFollowing: false }));
    } catch (error) {
      toast.error("Đã có lỗi xảy ra")
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async () => {

  };

  // ── RENDER HELPERS ──────────────────────────────────────────────────

  const renderFriendActionButtons = () => {
    if (ctx.isFriend) {
      return (
        <Button
          size="sm"
          disabled={isLoading}
          onClick={handleUnfriend}
          className="border-border text-foreground bg-muted hover:border-destructive hover:bg-destructive/10 hover:text-destructive group h-10 cursor-pointer gap-2 rounded-full border px-6! text-[12px] font-bold tracking-wide uppercase shadow-sm transition-all duration-200"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} className="group-hover:hidden" />}
          {!isLoading && <UserMinus size={14} className="hidden group-hover:block" />}
          <span className="group-hover:hidden">Bạn bè</span>
          <span className="hidden group-hover:inline">Hủy kết bạn</span>
        </Button>
      );
    }

    if (ctx.hasSentFriendRequest) {
      return (
        <Button
          size="sm"
          disabled={isLoading}
          onClick={handleCancelRequest}
          className="border-border text-foreground bg-muted hover:border-destructive hover:bg-destructive/10 hover:text-destructive group h-10 cursor-pointer gap-2 rounded-full border px-6! text-[12px] font-bold tracking-wide uppercase shadow-sm transition-all duration-200"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} className="group-hover:text-destructive text-foreground/70 transition-colors" />}
          <span className="group-hover:hidden">Đã gửi lời mời</span>
          <span className="hidden group-hover:inline">Hủy lời mời</span>
        </Button>
      );
    }

    if (ctx.hasReceivedFriendRequest) {
      return (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={isLoading}
            onClick={handleAcceptRequest}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 cursor-pointer gap-2 rounded-full px-6! text-[12px] font-bold tracking-wide uppercase shadow-sm transition-all duration-200"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Chấp nhận
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isLoading}
            onClick={handleDeclineRequest}
            className="flex items-center border-border hover:bg-muted text-foreground h-10 uppercase cursor-pointer gap-2 rounded-full px-4! text-[12px] font-bold racking-wide shadow-sm transition-all duration-200"
            title="Xóa lời mời"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
            Từ chối
          </Button>
        </div>
      );
    }

    // Default: Chưa kết bạn
    return (
      <Button
        size="sm"
        disabled={isLoading}
        onClick={handleAddFriend}
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 cursor-pointer gap-2 rounded-full px-6! text-[12px] font-bold tracking-wide uppercase shadow-sm transition-all duration-200 hover:scale-105"
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
        Thêm bạn bè
      </Button>
    );
  };

  // ────────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-7">
      {/* Name & role */}
      <div className="mb-4 space-y-1.5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h1 className="text-foreground text-2xl font-extrabold tracking-tight md:text-[28px]">
            {profile.displayName}
          </h1>

          {profile.isVerified && (
            <span className="bg-primary text-primary-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-sm">
              <Check size={12} className="shrink-0" />
            </span>
          )}
        </div>

        <p className="text-foreground/50 flex justify-center text-sm font-medium">
          @{profile.username} {profile.location && <>· {profile.cocupation}</>}
        </p>
      </div>

      {/* Meta row */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
        {profile.location && (
          <span className="text-foreground/60 flex items-center gap-1.5 text-[13px] font-medium">
            <MapPin size={14} className="text-foreground/40 shrink-0" />
            {profile.location}
          </span>
        )}
        <span className="text-foreground/60 flex items-center gap-1.5 text-[13px] font-medium">
          <Calendar size={14} className="text-foreground/40 shrink-0" />
          Tham gia{" "}
          {formatRelativeTime(profile.createdAt, {
            style: "absolute",
            showTime: false,
          })}
        </span>
        {profile?.socialMedia?.website && (
          <a
            href="#"
            className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-[13px] font-medium transition-colors"
          >
            <Link2 size={14} className="shrink-0" />
            {profile.socialMedia.website}
          </a>
        )}
      </div>

      {profile.biography && (
        <div className="mb-6 flex justify-center px-4">
          <p className="text-foreground/70 max-w-2xl text-center text-[14px] leading-relaxed whitespace-pre-wrap">
            {profile.biography}
          </p>
        </div>
      )}

      {/* ── HIỂN THỊ NẾU BỊ CHẶN ── */}
      {ctx.isBlocked ? (
        <div className="bg-destructive/10 border-destructive/20 mx-auto my-6 flex max-w-lg flex-col items-center gap-3 rounded-2xl border p-6 text-center">
          <Ban size={32} className="text-destructive opacity-80" />
          <p className="text-foreground font-medium">Bạn đã chặn người dùng này</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCtx(prev => ({ ...prev, isBlocked: false }))}
            className="rounded-full"
          >
            Bỏ chặn
          </Button>
        </div>
      ) : (
        <>
          {/* ── ACTION BUTTONS ── */}
          <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
            {ctx.isOwner ? (
              <>
                <Link
                  href={`/${profile.username}/general`}
                  className="inline-flex items-center justify-center border border-border text-foreground hover:bg-muted h-10 cursor-pointer gap-2 rounded-full px-6! text-[12px] font-bold tracking-wide uppercase transition-all"
                >
                  <Pencil size={14} />
                  <span>Chỉnh sửa</span>
                </Link>
                <Button variant="outline" size="sm" className="text-foreground border-border hover:bg-muted h-10 cursor-pointer gap-2 rounded-full px-6! text-[12px] font-bold tracking-wide uppercase transition-all">
                  <Share2 size={14} /> Chia sẻ
                </Button>
              </>
            ) : (
              <>
                {/* Logic Kết Bạn */}
                {renderFriendActionButtons()}

                {/* Nút Nhắn Tin (Kiểm tra canMessage) */}
                {ctx.canMessage && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted h-10 cursor-pointer gap-2 rounded-full px-6! text-[12px] font-bold tracking-wide uppercase transition-all"
                  >
                    <MessageSquare size={14} /> Nhắn tin
                  </Button>
                )}

                {/* Menu Thêm */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="border-border hover:bg-muted h-10 w-10 rounded-full transition-all">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border-border text-card-foreground w-48 rounded-2xl p-1 shadow-lg">
                    <DropdownMenuItem className="hover:bg-muted focus:bg-muted cursor-pointer gap-2.5 rounded-xl p-2.5 text-sm font-medium">
                      <Copy size={14} className="text-foreground/60" /> Sao chép liên kết
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-muted focus:bg-muted cursor-pointer gap-2.5 rounded-xl p-2.5 text-sm font-medium">
                      <BellOff size={14} className="text-foreground/60" /> Tắt thông báo
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border my-1" />

                    {/* Thêm chức năng chặn vào menu */}
                    <DropdownMenuItem
                      onClick={handleBlockUser}
                      className="hover:bg-muted focus:bg-muted cursor-pointer gap-2.5 rounded-xl p-2.5 text-sm font-medium"
                    >
                      <UserMinus size={14} className="text-foreground/60" /> Chặn người dùng
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2.5 rounded-xl p-2.5 text-sm font-medium">
                      <Flag size={14} /> Báo cáo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="bg-muted/40 border-border/50 mx-auto my-7 flex max-w-[90%] items-center justify-between rounded-3xl border p-2 shadow-sm backdrop-blur-sm md:max-w-[70%]">
            {[
              { value: profile.stats.totalPosts, label: "Bài viết" },
              { value: profile.stats.friends, label: "Bạn bè" },
              { value: profile.stats.followers, label: "Người theo dõi" },
              { value: profile.stats.following, label: "Đang theo dõi" },
            ].map((s) => (
              <div key={s.label} className="flex-1">
                <StatButton value={s.value} label={s.label} />
              </div>
            ))}
          </div>
        </>
      )}

      <Separator className="bg-border opacity-70" />
    </div>
  );
}