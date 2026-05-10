import { MessageSnippetResponse } from "@/types/chat";

export const formatSystemMessage = (msg: MessageSnippetResponse, currentUserId?: string) => {
    if (!msg.actionMetadata) return msg.content;

    const meta = msg.actionMetadata;
    const isActorMe = msg.senderId === currentUserId;
    const actorName = isActorMe ? "Bạn" : (msg.senderName || "Ai đó");

    // Xử lý mảng targets (những người bị tác động: thêm, xóa...)
    const targetNames = meta.targets?.map((target, index) => {
        const isTargetMe = target.id === currentUserId;
        return isTargetMe ? "bạn" : target.name;
    }).join(", ");

    // Map theo các case trong Kpett.ChatApp.Enums.MessageActionType
    switch (meta.actionType) {
        case "GroupCreated":
            return `${actorName} đã tạo nhóm`;
        case "GroupNameChanged":
            return `${actorName} đã đổi tên nhóm thành "${meta.newName}"`;
        case "GroupAvatarChanged":
            return `${actorName} đã thay đổi ảnh đại diện nhóm`;
        case "MemberAdded":
            return `${actorName} đã thêm ${targetNames} vào nhóm`;
        case "MemberRemoved":
            return `${actorName} đã xóa ${targetNames} khỏi nhóm`;
        case "MemberLeft":
            return `${actorName} đã rời khỏi nhóm`;
        case "AdminPromoted":
            return `${actorName} đã chỉ định ${targetNames} làm quản trị viên`;
        case "AdminDemoted":
            return `${actorName} đã gỡ quyền quản trị viên của ${targetNames}`;
        case "MessagePinned":
            return `${actorName} đã ghim một tin nhắn`;
        case "MessageUnpinned":
            return `${actorName} đã bỏ ghim một tin nhắn`;
        case "CallStarted":
            return `${actorName} đã bắt đầu một cuộc gọi`;
        case "CallEnded":
            return `Cuộc gọi đã kết thúc`;
        default:
            return msg.content;
    }
};