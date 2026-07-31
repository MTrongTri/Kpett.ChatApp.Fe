// hooks/use-track-presence.ts
import { useSignalR } from "@/components/providers/signalr-provider";
import { useEffect, useMemo } from "react";

export const useTrackPresence = (
    userIds: string[],
    onStatusChange?: (data: { userId: string; isOnline: boolean }) => void
) => {
    const { connection, isConnected, reconnectVersion } = useSignalR();

    // Chuyển array thành string để tối ưu dependencies cho useEffect (tránh re-render vô hạn)
    const userIdsString = useMemo(() => {
        // Lọc bỏ các giá trị rỗng/undefined và join lại
        return userIds.filter(Boolean).join(',');
    }, [userIds]);

    // LẮNG NGHE SỰ KIỆN TỪ BACKEND
    useEffect(() => {
        if (!connection || !isConnected || !onStatusChange) return;

        // Đăng ký sự kiện
        connection.on("UserStatusChanged", onStatusChange);

        return () => {
            // Hủy đăng ký khi unmount hoặc khi callback thay đổi
            connection.off("UserStatusChanged", onStatusChange);
        };
    }, [connection, isConnected, reconnectVersion, onStatusChange]);

    // GỬI YÊU CẦU ĐĂNG KÝ THEO DÕI (SUBSCRIBE/UNSUBSCRIBE)
    useEffect(() => {
        if (!connection || !isConnected || !userIdsString) return;

        const targetUserIds = userIdsString.split(',');

        // Gọi backend đăng ký
        connection.invoke("SubscribeToPresence", targetUserIds)
            .catch(err => console.error("Lỗi khi subscribe presence:", err));

        return () => {
            // Gọi backend hủy đăng ký khi Component chứa hook này unmount 
            // hoặc khi danh sách userIds thay đổi
            if (connection.state === "Connected") {
                connection.invoke("UnsubscribeFromPresence", targetUserIds)
                    .catch(err => console.error("Lỗi khi unsubscribe presence:", err));
            }
        };
    }, [connection, isConnected, reconnectVersion, userIdsString]);
};