"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Check, X, Loader2, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user/user-avatar";
import { formatRelativeTime } from "@/lib/format-date-utils";
import {
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
  type GroupInvitationResponse,
} from "@/services/group.service";
import { getGroupDetailById } from "@/services/group.service";

function InvitationCard({
  invitation,
  onAccept,
  onDecline,
  isProcessing,
}: {
  invitation: GroupInvitationResponse & { groupName?: string; inviterName?: string };
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isProcessing: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
          {(invitation.groupName || "G").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">
            {invitation.groupName || "Nhóm không tên"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Được mời bởi {invitation.inviterName || "Người dùng"} &middot;{" "}
            {formatRelativeTime(invitation.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          className="rounded-xl"
          onClick={() => onAccept(invitation.id)}
          disabled={isProcessing}
        >
          <Check size={14} className="mr-1" /> Chấp nhận
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl text-destructive"
          onClick={() => onDecline(invitation.id)}
          disabled={isProcessing}
        >
          <X size={14} className="mr-1" /> Từ chối
        </Button>
      </div>
    </div>
  );
}

export default function InvitationsPage() {
  const queryClient = useQueryClient();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["my-invitations"],
    queryFn: getMyInvitations,
    staleTime: 15 * 1000,
  });

  const enrichedInvitations = invitations ?? [];

  const { mutate: handleAccept, isPending: isAccepting } = useMutation({
    mutationFn: (invitationId: string) => acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["my-groups"] });
      toast.success("Đã tham gia nhóm thành công!");
    },
    onError: () => toast.error("Không thể chấp nhận lời mời."),
  });

  const { mutate: handleDecline, isPending: isDeclining } = useMutation({
    mutationFn: (invitationId: string) => declineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      toast.success("Đã từ chối lời mời.");
    },
    onError: () => toast.error("Không thể từ chối lời mời."),
  });

  const isProcessing = isAccepting || isDeclining;

  return (
    <div className="mt-14.5 min-h-[calc(100vh-5rem)] bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <Link href="/groups">
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lời mời tham gia nhóm</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Các lời mời bạn đã nhận được từ bạn bè.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : enrichedInvitations.length === 0 ? (
          <div className="border-border bg-card rounded-3xl border p-10 text-center shadow-sm">
            <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
              <Mail size={24} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Không có lời mời nào</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn chưa nhận được lời mời tham gia nhóm nào.
            </p>
            <Button asChild className="mt-4 rounded-full">
              <Link href="/groups">Quay lại nhóm</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {enrichedInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={{
                  ...invitation,
                  groupName: undefined,
                  inviterName: undefined,
                }}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
