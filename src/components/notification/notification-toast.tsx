import { X } from "lucide-react";
import { UserAvatar } from "@/components/user/user-avatar";
import { NotificationResponse } from "@/types/notification";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getNotificationHref } from "@/lib/notification-link";

interface NotificationToastProps {
    toastId: string | number;
    notification: NotificationResponse;
    text: string;
}

export function NotificationToast({ toastId, notification, text }: NotificationToastProps) {
    const router = useRouter();

    const handleToastClick = () => {
        const link = getNotificationHref(notification);

        // Đóng toast ngay khi click
        toast.dismiss(toastId);

        // Chuyển hướng trang
        if (link !== "#") {
            router.push(link);
        }
    };

    return (
        <div
            onClick={handleToastClick}
            className="relative flex w-87.5 cursor-pointer items-start gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 shadow-xl transition-all"
        >
            <UserAvatar
                user={{
                    avatarUrl: notification.actor?.avatarUrl,
                    displayName: notification.actor?.displayName || "",
                    username: notification.actor?.username || "",
                    id: notification.actor?.id || ""
                }}
                className="h-11 w-11 shrink-0"
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <p className="line-clamp-2 text-sm leading-snug text-foreground">
                    <span className="mr-1 font-bold">
                        {notification.actor?.displayName || "Ai đó"}
                    </span>
                    {text}
                </p>
                {/* <span className="mt-1.5 text-xs font-medium text-primary">
                    Vừa xong
                </span> */}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(toastId);
                }}
                className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            >
                <X size={16} />
            </button>
        </div>
    );
}
