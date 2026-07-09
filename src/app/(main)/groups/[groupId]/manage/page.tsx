"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Settings,
  Shield,
  Users,
  MessageSquare,
  Lock,
  Image as ImageIcon,
  MoreVertical,
  Check,
  X,
  Crown,
  Search,
  Globe2,
  Loader2,
  UserMinus,
  UserCheck,
  Ban,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/user/user-avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getGroupDetailById,
  updateGroup,
  getGroupSettings,
  updateGroupSettings,
  getGroupMembers,
  getGroupPendingJoinRequests,
  acceptJoinRequest,
  declineJoinRequest,
  kickMember,
  updateMemberRole,
  getGroupPosts,
  moderateGroupPost,
  deleteGroup,
} from "@/services/group.service";
import type { GroupDetailResponse, GroupSettingsResponse, GroupRule } from "@/types/group";
import type { GroupMemberResponse } from "@/types/group-member";
import type { Post } from "@/types/post";

type AdminTab = "general" | "permissions" | "members" | "pending_posts";

export default function GroupManagePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const groupId = params.groupId as string;

  const [activeTab, setActiveTab] = useState<AdminTab>("general");

  const { data: group, isLoading: isGroupLoading } = useQuery<GroupDetailResponse>({
    queryKey: ["group-detail", groupId],
    queryFn: () => getGroupDetailById(groupId),
    enabled: !!groupId,
    staleTime: 60 * 1000,
  });

  const { data: groupSettings, isLoading: isSettingsLoading } = useQuery<GroupSettingsResponse>({
    queryKey: ["group-settings", groupId],
    queryFn: () => getGroupSettings(groupId),
    enabled: !!groupId,
    staleTime: 60 * 1000,
  });

  const isAdmin = group?.myRole === "admin";

  if (!user) return null;

  if (isGroupLoading || isSettingsLoading) {
    return (
      <div className="mt-14.5 flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!group || (!isAdmin && group.myRole !== "admin" && group.myRole !== "moderator")) {
    return (
      <div className="mt-14.5 flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="border-border bg-card max-w-md rounded-3xl border p-8 text-center shadow-sm">
          <Shield size={40} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Không có quyền truy cập</h1>
          <p className="mt-3 text-sm text-muted-foreground">Bạn cần là quản trị viên hoặc kiểm duyệt viên để quản lý nhóm này.</p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href={`/groups/${groupId}`}>Quay lại nhóm</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14.5 min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/groups/${groupId}`)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft size={20} className="text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Quản lý nhóm</h1>
              <p className="text-sm text-muted-foreground">Thiết lập và kiểm duyệt hoạt động của nhóm</p>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/groups/${groupId}`}>Xem nhóm</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 lg:gap-8">

          <div className="space-y-1">
            <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Cài đặt</h3>
            <button
              onClick={() => setActiveTab("general")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
                activeTab === "general" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Settings size={18} />
              Thông tin chung
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
                activeTab === "permissions" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Shield size={18} />
              Quyền & Phê duyệt
            </button>

            <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground mt-6 mb-2">Kiểm duyệt</h3>
            <MembersNavButton
              activeTab={activeTab}
              tab="members"
              groupId={groupId}
              onClick={setActiveTab}
            />
            <PendingPostsNavButton
              activeTab={activeTab}
              tab="pending_posts"
              groupId={groupId}
              onClick={setActiveTab}
            />
          </div>

          <div className="bg-card border border-border rounded-[2rem] shadow-sm min-h-[600px] overflow-hidden">
            {activeTab === "general" && <GeneralTab group={group} groupId={groupId} />}
            {activeTab === "permissions" && <PermissionsTab groupSettings={groupSettings} groupId={groupId} />}
            {activeTab === "members" && <MembersTab groupId={groupId} />}
            {activeTab === "pending_posts" && <PendingPostsTab groupId={groupId} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function MembersNavButton({ activeTab, tab, groupId, onClick }: { activeTab: string; tab: string; groupId: string; onClick: (t: AdminTab) => void }) {
  const { data } = useQuery({
    queryKey: ["group-pending-join-count", groupId],
    queryFn: () => getGroupPendingJoinRequests(groupId),
    enabled: !!groupId,
    staleTime: 30 * 1000,
  });
  const count = data?.totalCount ?? 0;

  return (
    <button
      onClick={() => onClick(tab as AdminTab)}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
        activeTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
      )}
    >
      <div className="flex items-center gap-3">
        <Users size={18} />
        Thành viên
      </div>
      {count > 0 && (
        <span className="bg-destructive/10 text-destructive text-[11px] px-2 py-0.5 rounded-full font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

function PendingPostsNavButton({ activeTab, tab, groupId, onClick }: { activeTab: string; tab: string; groupId: string; onClick: (t: AdminTab) => void }) {
  const { data } = useQuery({
    queryKey: ["group-pending-posts-count", groupId],
    queryFn: () => getGroupPosts(groupId, null, 1, "pending"),
    enabled: !!groupId,
    staleTime: 30 * 1000,
  });
  const count = data?.pagination?.totalCount ?? 0;

  return (
    <button
      onClick={() => onClick(tab as AdminTab)}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors",
        activeTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
      )}
    >
      <div className="flex items-center gap-3">
        <MessageSquare size={18} />
        Bài đăng chờ duyệt
      </div>
      {count > 0 && (
        <span className="bg-destructive/10 text-destructive text-[11px] px-2 py-0.5 rounded-full font-bold">
          {count}
        </span>
      )}
    </button>
  );
}

// ── General Tab ──

function GeneralTab({ group, groupId }: { group: GroupDetailResponse; groupId: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [privacy, setPrivacy] = useState(group.type);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const { uploadFileToCloudinary } = await import("@/services/media.service");
      const result = await uploadFileToCloudinary(file, "group-covers");
      saveGroup({ coverImageUrl: result.url });
    } catch {
      toast.error("Không thể tải ảnh bìa lên.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const { mutate: saveGroup, isPending } = useMutation({
    mutationFn: (data: { name?: string; description?: string; type?: string; coverImageUrl?: string }) =>
      updateGroup(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-detail", groupId] });
      toast.success("Đã lưu thông tin nhóm.");
    },
    onError: () => toast.error("Có lỗi xảy ra khi lưu."),
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { mutate: removeGroup, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast.success("Đã giải tán nhóm.");
      router.push("/groups");
    },
    onError: () => toast.error("Có lỗi xảy ra khi giải tán nhóm."),
  });

  const handleSave = () => {
    saveGroup({ name, description, type: privacy });
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground">Thông tin chung</h2>
        <p className="text-sm text-muted-foreground mt-1">Quản lý tên, mô tả và quyền riêng tư của nhóm.</p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">Ảnh bìa nhóm</label>
          <div
            className="h-40 w-full rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {group.coverImageUrl ? (
              <img src={group.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
            ) : null}
            {isUploadingCover ? (
              <Loader2 size={32} className="animate-spin text-primary z-10" />
            ) : (
              <div className="text-center z-10">
                <ImageIcon size={32} className="mx-auto text-muted-foreground mb-2" />
                <span className="text-sm font-medium text-primary">Thay đổi ảnh bìa</span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Tên nhóm</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Mô tả nhóm</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full min-h-[120px] p-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none text-foreground"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Quyền riêng tư</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setPrivacy("public")}
              className={cn(
                "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                privacy === "public" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              <Globe2 size={24} className={privacy === "public" ? "text-primary" : "text-muted-foreground"} />
              <h4 className="font-bold text-foreground mt-2">Công khai</h4>
              <p className="text-xs text-muted-foreground mt-1">Bất kỳ ai cũng có thể xem thành viên và bài viết.</p>
            </div>
            <div
              onClick={() => setPrivacy("private")}
              className={cn(
                "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                privacy === "private" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              <Lock size={24} className={privacy === "private" ? "text-primary" : "text-muted-foreground"} />
              <h4 className="font-bold text-foreground mt-2">Riêng tư</h4>
              <p className="text-xs text-muted-foreground mt-1">Chỉ thành viên mới có thể xem nội dung trong nhóm.</p>
            </div>
            <div
              onClick={() => setPrivacy("hidden")}
              className={cn(
                "p-4 rounded-2xl border-2 cursor-pointer transition-all",
                privacy === "hidden" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
            >
              <Lock size={24} className={privacy === "hidden" ? "text-primary" : "text-muted-foreground"} />
              <h4 className="font-bold text-foreground mt-2">Ẩn</h4>
              <p className="text-xs text-muted-foreground mt-1">Chỉ thành viên mới tìm thấy và xem nội dung.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-between">
          <div className="space-y-2">
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive rounded-xl"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Giải tán nhóm
            </Button>
            {showDeleteConfirm && (
              <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-destructive">
                  Bạn có chắc chắn muốn giải tán nhóm này? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-lg"
                    onClick={() => removeGroup()}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                    Xác nhận giải tán
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-lg" onClick={() => setShowDeleteConfirm(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Button className="rounded-xl px-8" onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Permissions Tab ──

function PermissionsTab({ groupSettings, groupId }: { groupSettings?: GroupSettingsResponse; groupId: string }) {
  const queryClient = useQueryClient();

  const [postApproval, setPostApproval] = useState(groupSettings?.postApproval ?? false);
  const [memberApproval, setMemberApproval] = useState(groupSettings?.memberApproval ?? false);
  const [whoCanPost, setWhoCanPost] = useState(groupSettings?.whoCanPost ?? "anyone");
  const [whoCanInvite, setWhoCanInvite] = useState(groupSettings?.whoCanInvite ?? "anyone");

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: () =>
      updateGroupSettings(groupId, {
        postApproval,
        memberApproval,
        whoCanPost,
        whoCanInvite,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-settings", groupId] });
      toast.success("Đã lưu cài đặt quyền.");
    },
    onError: () => toast.error("Có lỗi xảy ra khi lưu."),
  });

  const whoCanPostOptions = [
    { value: "anyone", label: "Tất cả thành viên" },
    { value: "admin_mod", label: "Quản trị & Kiểm duyệt" },
    { value: "admin_only", label: "Chỉ Quản trị viên" },
  ];

  const whoCanInviteOptions = [
    { value: "anyone", label: "Tất cả thành viên" },
    { value: "admin_mod", label: "Quản trị & Kiểm duyệt" },
    { value: "admin_only", label: "Chỉ Quản trị viên" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground">Quyền & Phê duyệt</h2>
        <p className="text-sm text-muted-foreground mt-1">Kiểm soát ai được phép tham gia và đăng bài trong nhóm.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="font-bold text-foreground mb-4">Bài đăng</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">Phê duyệt bài viết</h4>
                <p className="text-sm text-muted-foreground mt-0.5">Yêu cầu Quản trị viên duyệt bài trước khi hiển thị trên nhóm.</p>
              </div>
              <Switch checked={postApproval} onCheckedChange={setPostApproval} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Ai có thể đăng bài?</label>
              <select
                value={whoCanPost}
                onChange={(e) => setWhoCanPost(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {whoCanPostOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="font-bold text-foreground mb-4">Thành viên</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">Phê duyệt người tham gia</h4>
                <p className="text-sm text-muted-foreground mt-0.5">Admin phải phê duyệt mọi yêu cầu xin vào nhóm.</p>
              </div>
              <Switch checked={memberApproval} onCheckedChange={setMemberApproval} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Ai có thể mời thành viên?</label>
              <select
                value={whoCanInvite}
                onChange={(e) => setWhoCanInvite(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {whoCanInviteOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="rounded-xl px-8" onClick={() => saveSettings()} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Members Tab ──

function MembersTab({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState("");
  const [showPending, setShowPending] = useState(false);

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["group-members", groupId, keyword],
    queryFn: () => getGroupMembers(groupId, { keyword: keyword || undefined, pageSize: 50 }),
    enabled: !!groupId,
    staleTime: 30 * 1000,
  });

  const { data: pendingData, isLoading: isPendingLoading } = useQuery({
    queryKey: ["group-pending-join", groupId],
    queryFn: () => getGroupPendingJoinRequests(groupId),
    enabled: !!groupId && showPending,
    staleTime: 15 * 1000,
  });

  const members = membersData?.items ?? [];
  const pendingMembers = pendingData?.items ?? [];

  const handleKick = useCallback(async (member: GroupMemberResponse) => {
    if (!window.confirm(`Xóa ${member.displayName || member.username} khỏi nhóm?`)) return;
    try {
      await kickMember(groupId, member.userId);
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
      toast.success("Đã xóa thành viên.");
    } catch {
      toast.error("Không thể xóa thành viên.");
    }
  }, [groupId, queryClient]);

  const handleRoleChange = useCallback(async (member: GroupMemberResponse, role: string) => {
    try {
      await updateMemberRole(groupId, member.userId, role);
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
      toast.success(`Đã cập nhật vai trò thành ${role === "admin" ? "Quản trị viên" : role === "moderator" ? "Kiểm duyệt viên" : "Thành viên"}.`);
    } catch {
      toast.error("Không thể cập nhật vai trò.");
    }
  }, [groupId, queryClient]);

  const handleAcceptJoin = useCallback(async (userId: string) => {
    try {
      await acceptJoinRequest(groupId, userId);
      queryClient.invalidateQueries({ queryKey: ["group-pending-join", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-pending-join-count", groupId] });
      toast.success("Đã chấp nhận yêu cầu tham gia.");
    } catch {
      toast.error("Không thể chấp nhận yêu cầu.");
    }
  }, [groupId, queryClient]);

  const handleDeclineJoin = useCallback(async (userId: string) => {
    try {
      await declineJoinRequest(groupId, userId);
      queryClient.invalidateQueries({ queryKey: ["group-pending-join", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-pending-join-count", groupId] });
      toast.success("Đã từ chối yêu cầu.");
    } catch {
      toast.error("Không thể từ chối yêu cầu.");
    }
  }, [groupId, queryClient]);

  const pendingCount = pendingData?.totalCount ?? 0;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-6 lg:p-8 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Quản lý Thành viên</h2>
        <p className="text-sm text-muted-foreground mt-1">Xem, cấp quyền và xóa thành viên.</p>
      </div>

      <div className="px-6 py-4 flex gap-4 border-b border-border bg-muted/20">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm thành viên..."
            className="pl-9 h-10 rounded-xl"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <Button
          variant={showPending ? "default" : "outline"}
          className="rounded-xl shrink-0"
          onClick={() => setShowPending(!showPending)}
        >
          Yêu cầu tham gia {pendingCount > 0 && `(${pendingCount})`}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {showPending ? (
          isPendingLoading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto h-6 w-6 text-primary" /></div>
          ) : pendingMembers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Không có yêu cầu tham gia nào.</div>
          ) : (
            <div className="space-y-2">
              {pendingMembers.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      user={{ id: member.userId, username: member.username || "", displayName: member.displayName || member.username || "", avatarUrl: null }}
                      className="h-10 w-10"
                    />
                    <div>
                      <p className="text-sm font-bold text-foreground">{member.displayName || member.username}</p>
                      <p className="text-xs text-muted-foreground">@{member.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="rounded-xl" onClick={() => handleAcceptJoin(member.userId)}>
                      <Check size={14} className="mr-1" /> Duyệt
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl text-destructive" onClick={() => handleDeclineJoin(member.userId)}>
                      <X size={14} className="mr-1" /> Từ chối
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </div>
          ))
        ) : members.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">Chưa có thành viên nào.</div>
        ) : (
          <div className="space-y-1">
            {members.map((member) => (
              <MemberRow
                key={member.userId}
                member={member}
                groupId={groupId}
                onKick={handleKick}
                onRoleChange={handleRoleChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberRow({ member, groupId, onKick, onRoleChange }: {
  member: GroupMemberResponse;
  groupId: string;
  onKick: (member: GroupMemberResponse) => void;
  onRoleChange: (member: GroupMemberResponse, role: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-xl transition-colors group">
      <div className="flex items-center gap-3">
        <UserAvatar
          user={{ id: member.userId, username: member.username || "", displayName: member.displayName || member.username || "", avatarUrl: null }}
          className="h-10 w-10"
        />
        <div>
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            {member.displayName || member.username}
            {member.role === "admin" && <Crown size={14} className="text-amber-500" />}
            {member.role === "moderator" && <Shield size={14} className="text-blue-500" />}
          </p>
          <p className="text-xs text-muted-foreground">@{member.username}</p>
        </div>
      </div>

      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={18} />
        </Button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-card border border-border rounded-2xl shadow-lg py-2 animate-in fade-in zoom-in">
              <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vai trò</div>
              {["member", "moderator", "admin"].map((role) => (
                <button
                  key={role}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-muted/50",
                    member.role === role && "text-primary font-semibold"
                  )}
                  onClick={() => {
                    onRoleChange(member, role);
                    setShowMenu(false);
                  }}
                >
                  {role === "admin" && <Crown size={14} className="text-amber-500" />}
                  {role === "moderator" && <Shield size={14} className="text-blue-500" />}
                  {role === "member" && <UserCheck size={14} />}
                  {role === "admin" ? "Quản trị viên" : role === "moderator" ? "Kiểm duyệt viên" : "Thành viên"}
                </button>
              ))}
              <div className="border-t border-border my-1" />
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                onClick={() => {
                  onKick(member);
                  setShowMenu(false);
                }}
              >
                <UserMinus size={14} />
                Xóa khỏi nhóm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Pending Posts Tab ──

function PendingPostsTab({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["group-approval-posts", groupId],
    queryFn: () => getGroupPosts(groupId, null, 50, "pending"),
    enabled: !!groupId,
    staleTime: 15 * 1000,
  });

  const posts = data?.items ?? [];

  const handleApprove = useCallback(async (postId: string) => {
    try {
      await moderateGroupPost(groupId, postId, "approved");
      queryClient.invalidateQueries({ queryKey: ["group-approval-posts", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-pending-posts-count", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-posts", groupId] });
      toast.success("Đã duyệt bài viết.");
    } catch {
      toast.error("Không thể duyệt bài viết.");
    }
  }, [groupId, queryClient]);

  const handleReject = useCallback(async (postId: string) => {
    try {
      await moderateGroupPost(groupId, postId, "rejected");
      queryClient.invalidateQueries({ queryKey: ["group-approval-posts", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-pending-posts-count", groupId] });
      toast.success("Đã từ chối bài viết.");
    } catch {
      toast.error("Không thể từ chối bài viết.");
    }
  }, [groupId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-6 w-6 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-6 lg:p-8 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Bài đăng chờ duyệt</h2>
        <p className="text-sm text-muted-foreground mt-1">Duyệt hoặc từ chối các bài viết được gửi bởi thành viên.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/20">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post: Post) => (
              <div key={post.id} className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <UserAvatar
                    user={{
                      id: post.author?.id || "",
                      username: post.author?.username || "",
                      displayName: post.author?.displayName || "Người dùng",
                      avatarUrl: post.author?.avatarUrl || null,
                    }}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="text-sm font-bold text-foreground">{post.author?.displayName || "Người dùng"}</p>
                  </div>
                </div>
                <p className="text-foreground text-[15px] mb-5">{post.content}</p>
                <div className="flex gap-2">
                  <Button className="flex-1 rounded-xl" onClick={() => handleApprove(post.id)}>
                    <Check size={18} className="mr-2" /> Duyệt bài
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                    onClick={() => handleReject(post.id)}
                  >
                    <X size={18} className="mr-2" /> Từ chối
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Không có bài viết nào cần duyệt</h3>
            <p className="text-sm text-muted-foreground mt-1">Tất cả đều đã được xử lý xong!</p>
          </div>
        )}
      </div>
    </div>
  );
}
