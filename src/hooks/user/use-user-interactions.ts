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

type ActionType = "add" | "cancel" | "accept" | "decline" | "remove" | "block" | "unblock" | "message";

export function useUserInteractions(
  userId: string,
  username: string,
  initialContext: ProfileViewerContext,
) {
  const [ctx, setCtx] = useState<ProfileViewerContext>(initialContext);
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    setCtx(initialContext);
  }, [initialContext]);

  const refreshCache = () => {
    router.refresh();
  };

  const handleAddFriend = async () => {
    if (!currentUser) {
      toast.warning("Bạn cần đăng nhập để gửi lời mời kết bạn");
      return;
    }

    try {
      setLoadingAction("add");
      const data = await friendRequest(userId);

      if (!data) {
        toast.error("Đã có lỗi xảy ra, không nhận được phản hồi từ máy chủ");
        return;
      }

      setCtx((previous) => ({
        ...previous,
        relationshipRequestId: data.requestId,
        hasSentFriendRequest: true,
        isFollowing: true,
      }));

      refreshCache();
    } catch (error: any) {
      const errorCode = error?.response?.data?.errorCode;
      if (errorCode === 'FRIEND.FRIEND_REQUEST_PENDING') {
        toast.info("Người này đã gửi lời mời kết bạn cho bạn. Hãy kiểm tra và chấp nhận.");
        setCtx((previous) => ({
          ...previous,
          hasReceivedFriendRequest: true,
        }));
        refreshCache();
      } else {
        toast.error("Đã có lỗi xảy ra trong quá trình gửi yêu cầu");
        console.error("[handleAddFriend] Error:", error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelRequest = async () => {
    setLoadingAction("cancel");

    try {
      if (!ctx.relationshipRequestId) {
        toast.error("Đã có lỗi xảy ra");
        return;
      }

      await friendRequestCancel(ctx.relationshipRequestId);
      setCtx((previous) => ({
        ...previous,
        hasSentFriendRequest: false,
        relationshipRequestId: null,
      }));

      refreshCache();
    } catch (error: any) {
      const errorCode = error?.response?.data?.errorCode;
      if (errorCode === 'FRIEND.FRIEND_REQUEST_NOT_FOUND') {
        toast.error("Lời mời kết bạn không tồn tại hoặc đã được xử lý.");
        refreshCache();
      } else {
        toast.error("Đã có lỗi xảy ra");
        console.error("[handleCancelRequest] Error:", error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleAcceptRequest = async () => {
    setLoadingAction("accept");

    try {
      if (!ctx.relationshipRequestId) {
        toast.error("Đã có lỗi xảy ra");
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
    } catch (error: any) {
      const errorCode = error?.response?.data?.errorCode;
      if (errorCode === 'FRIEND.FRIEND_REQUEST_NOT_FOUND') {
        toast.error("Lời mời kết bạn không tồn tại hoặc đã được xử lý.");
        refreshCache();
      } else {
        toast.error("Đã có lỗi xảy ra");
        console.error("[handleAcceptRequest] Error:", error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeclineRequest = async () => {
    setLoadingAction("decline");

    try {
      if (!ctx.relationshipRequestId) {
        toast.error("Đã có lỗi xảy ra");
        return;
      }

      await friendRequestDecline(ctx.relationshipRequestId);
      setCtx((previous) => ({
        ...previous,
        hasReceivedFriendRequest: false,
        relationshipRequestId: null,
      }));

      refreshCache();
    } catch (error: any) {
      const errorCode = error?.response?.data?.errorCode;
      if (errorCode === 'FRIEND.FRIEND_REQUEST_NOT_FOUND') {
        toast.error("Lời mời kết bạn không tồn tại hoặc đã được xử lý.");
        refreshCache();
      } else {
        toast.error("Đã có lỗi xảy ra");
        console.error("[handleDeclineRequest] Error:", error);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnfriend = async () => {
    setLoadingAction("remove");

    try {
      await unFriend(userId);
      setCtx((previous) => ({
        ...previous,
        isFriend: false,
        isFollowing: false,
      }));

      refreshCache();
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
      console.error("[handleUnfriend] Error:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleBlockUser = async () => {
    setCtx((previous) => ({ ...previous, isBlocked: true }));
    refreshCache();
    toast.success("Đã chặn người dùng");
  };

  const handleUnblockUser = async () => {
    setCtx((previous) => ({ ...previous, isBlocked: false }));
    toast.success("Đã bỏ chặn người dùng");
  };

  const handleMessageClick = async () => {
    if (!currentUser) {
      toast.warning("Bạn cần đăng nhập để gửi tin nhắn");
      return;
    }

    try {
      setLoadingAction("message");
      const data = await chatService.getOrCreateDirectConversation(userId);

      if (data && data.id) {
        dispatch(openChatPopup(data.id));
      } else {
        toast.error("Không thể tạo cuộc trò chuyện");
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi tạo cuộc trò chuyện");
      console.error("[handleMessageClick] Error:", error);
    } finally {
      setLoadingAction(null);
    }
  };

  return {
    ctx,
    loadingAction,
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
