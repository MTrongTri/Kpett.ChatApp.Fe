"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
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
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useUserInteractions(userId: string, username: string, initialContext: ProfileViewerContext) {
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
        queryClient.invalidateQueries({ queryKey: ["user-profile", username] });

        router.refresh();
    };

    const handleAddFriend = async () => {
        if (!currentUser) {
            toast.warning("Bạn cần đăng nhập để thực hiện gửi lời mời kết bạn");
            return;
        }

        try {
            setIsLoading(true);
            const data = await friendRequest(userId);

            if (!data) {
                toast.error("Đã có lỗi xảy ra, không nhận được phản hồi");
                return;
            }

            setCtx((prev) => ({
                ...prev,
                relationshipRequestId: data.requestId,
                hasSentFriendRequest: true,
                isFollowing: true,
            }));

            refreshCache();

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
            if (!ctx.relationshipRequestId) {
                toast.error("Đã có lỗi xảy ra");
                return;
            }
            await friendRequestCancel(ctx.relationshipRequestId);
            setCtx((prev) => ({ ...prev, hasSentFriendRequest: false, relationshipRequestId: null }));

            refreshCache();
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        setIsLoading(true);
        try {
            if (!ctx.relationshipRequestId) {
                toast.error("Đã có lỗi xảy ra");
                return;
            }
            await friendRequestAccept(ctx.relationshipRequestId);
            setCtx((prev) => ({
                ...prev,
                hasReceivedFriendRequest: false,
                isFriend: true,
                isFollowing: true,
            }));

            refreshCache();
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeclineRequest = async () => {
        setIsLoading(true);
        try {
            if (!ctx.relationshipRequestId) {
                toast.error("Đã có lỗi xảy ra");
                return;
            }
            await friendRequestDecline(ctx.relationshipRequestId);
            setCtx((prev) => ({ ...prev, hasReceivedFriendRequest: false, relationshipRequestId: null }));

            refreshCache();
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnfriend = async () => {
        setIsLoading(true);
        try {
            await unFriend(userId);
            setCtx((prev) => ({ ...prev, isFriend: false, isFollowing: false }));

            refreshCache();
        } catch (error) {
            toast.error("Đã có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlockUser = async () => {
        // TODO
        setCtx((prev) => ({ ...prev, isBlocked: true }));

        refreshCache();
        toast.success("Đã chặn người dùng");
    };

    const handleUnblockUser = async () => {
        // TODO
        setCtx((prev) => ({ ...prev, isBlocked: false }));
        toast.success("Đã bỏ chặn người dùng");
    };

    const handleMessageClick = async () => {
        if (!currentUser) {
            toast.warning("Bạn cần đăng nhập để nhắn tin");
            return;
        }

        try {
            setIsMessageLoading(true);
            const data = await chatService.getOrCreateDirectConversation(userId);
            if (data && data.id) {
                dispatch(openChatPopup(data.id));
            } else {
                toast.error("Không thể tạo cuộc hội thoại");
            }
        } catch (error) {
            toast.error("Đã có lỗi xảy ra khi tạo cuộc hội thoại");
            console.error(error);
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