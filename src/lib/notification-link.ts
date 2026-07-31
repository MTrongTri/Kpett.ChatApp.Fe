import type { NotificationResponse } from "@/types/notification";

function readMetadata(metadata: NotificationResponse["metadata"]) {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  if (typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }

  return null;
}

function getStringValue(
  source: Record<string, unknown> | null,
  ...keys: string[]
) {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

export function getNotificationHref(notification: NotificationResponse) {
  if (notification.type.includes("Friend")) {
    return notification.actor?.username ? `/${notification.actor.username}` : "#";
  }

  if (notification.type === "CommentMention") {
    const metadata = readMetadata(notification.metadata);
    const postId =
      getStringValue(metadata, "postId", "PostId") ?? notification.referenceId;

    return postId ? `/post/${postId}` : "#";
  }

  if (notification.type === "GroupInvitationReceived") {
    return "/groups/invitations";
  }

  return "#";
}
