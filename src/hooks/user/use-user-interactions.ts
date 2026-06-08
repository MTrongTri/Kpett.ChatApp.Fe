"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { ProfileViewerContext } from "@/types/user";
import {
  friendRequest,
  friendRequestAccept,
  friendRequestCancel,
  friendRequestDecline,
  unFriend,
} from "@/services/friend.service";
import { chatService } from "@/services/chat.service";
import { openChatPopup } from "@/store/features/chat-slice";

export function useUserInteractions(
  userId: string,
  username: string,
  initialContext: ProfileViewerContext,
) {
  const [ctx, setCtx] = useState<ProfileViewerContext>(initialContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    setCtx(initialContext);
  }, [initialContext]);

  const refreshCache = () => {
    void queryClient.invalidateQueries({ queryKey: ["user-profile", username] });
    router.refresh();
  };

  const handleAddFriend = async () => {
    if (!currentUser) {
      toast.warning("Ban can dang nhap de gui loi moi ket ban");
      return;
    }

    try {
      setIsLoading(true);
      const data = await friendRequest(userId);

      if (!data) {
        toast.error("Da co loi xay ra, khong nhan duoc phan hoi");
        return;
      }

      setCtx((previous) => ({
        ...previous,
        relationshipRequestId: data.requestId,
        hasSentFriendRequest: true,
        isFollowing: true,
      }));

      refreshCache();
      toast.success("Da gui loi moi ket ban");
    } catch (error) {
      toast.error("Da co loi xay ra trong qua trinh gui yeu cau");
      console.error("[handleAddFriend] Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setIsLoading(true);

    try {
      if (!ctx.relationshipRequestId) {
        toast.error("Da co loi xay ra");
        return;
      }

      await friendRequestCancel(ctx.relationshipRequestId);
      setCtx((previous) => ({
        ...previous,
        hasSentFriendRequest: false,
        relationshipRequestId: null,
      }));

      refreshCache();
    } catch (error) {
      console.error("[handleCancelRequest] Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setIsLoading(true);

    try {
      if (!ctx.relationshipRequestId) {
        toast.error("Da co loi xay ra");
        return;
      }

      await friendRequestAccept(ctx.relationshipRequestId);
      setCtx((previous) => ({
        ...previous,
        hasReceivedFriendRequest: false,
        isFriend: true,
        isFollowing: true,
      }));

      refreshCache();
      void queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
    } catch (error) {
      toast.error("Da co loi xay ra");
      console.error("[handleAcceptRequest] Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    setIsLoading(true);

    try {
      if (!ctx.relationshipRequestId) {
        toast.error("Da co loi xay ra");
        return;
      }

      await friendRequestDecline(ctx.relationshipRequestId);
      setCtx((previous) => ({
        ...previous,
        hasReceivedFriendRequest: false,
        relationshipRequestId: null,
      }));

      refreshCache();
    } catch (error) {
      console.error("[handleDeclineRequest] Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = async () => {
    setIsLoading(true);

    try {
      await unFriend(userId);
      setCtx((previous) => ({
        ...previous,
        isFriend: false,
        isFollowing: false,
      }));

      refreshCache();
    } catch (error) {
      toast.error("Da co loi xay ra");
      console.error("[handleUnfriend] Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async () => {
    setCtx((previous) => ({ ...previous, isBlocked: true }));
    refreshCache();
    toast.success("Da chan nguoi dung");
  };

  const handleUnblockUser = async () => {
    setCtx((previous) => ({ ...previous, isBlocked: false }));
    toast.success("Da bo chan nguoi dung");
  };

  const handleMessageClick = async () => {
    if (!currentUser) {
      toast.warning("Ban can dang nhap de nhan tin");
      return;
    }

    try {
      setIsMessageLoading(true);
      const data = await chatService.getOrCreateDirectConversation(userId);

      if (data && data.id) {
        dispatch(openChatPopup(data.id));
      } else {
        toast.error("Khong the tao cuoc hoi thoai");
      }
    } catch (error) {
      toast.error("Da co loi xay ra khi tao cuoc hoi thoai");
      console.error("[handleMessageClick] Error:", error);
    } finally {
      setIsMessageLoading(false);
    }
  };

  return {
    ctx,
    isLoading,
    isMessageLoading,
    actions: {
      handleAddFriend,
      handleCancelRequest,
      handleAcceptRequest,
      handleDeclineRequest,
      handleUnfriend,
      handleBlockUser,
      handleUnblockUser,
      handleMessageClick,
    },
  };
}
