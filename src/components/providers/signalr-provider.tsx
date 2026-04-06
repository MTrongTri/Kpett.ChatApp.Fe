"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";

interface SignalRContextType {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
}

const SignalRContext = createContext<SignalRContextType>({
    connection: null,
    isConnected: false,
});

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = Cookies.get("access_token");

        if (!token) {
            return;
        }

        // 2. Khởi tạo cấu hình kết nối
        const hubUrl = `${process.env.NEXT_PUBLIC_API_URL_SIGNALR || "https://localhost:7068"}/chat-Hub`;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => {
                    const currentToken = Cookies.get("access_token");
                    return currentToken || "";
                },
                withCredentials: true
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .build();

        setConnection(newConnection);

        // Khởi động kết nối
        const startConnection = async () => {
            try {
                await newConnection.start();
                setIsConnected(true);
                console.log("SignalR connection successful!");

                // --- ĐĂNG KÝ LẮNG NGHE CÁC SỰ KIỆN TỪ BACKEND ---

                // newConnection.on("UserOnlineStatusChanged", (data: { userId: string, isOnline: boolean }) => {
                //     console.log(`User ${data.userId} is now ${data.isOnline ? "Online" : "Offline"}`);
                // });

            } catch (err) {
                console.error("SignalR connection failed", err);
            }
        };

        startConnection();

        // Cleanup: Ngắt kết nối khi Component unmount (user đóng tab/đăng xuất)
        return () => {
            if (newConnection) {
                newConnection.stop().then(() => {
                    console.log("Disconnect SignalR.");
                    setIsConnected(false);
                });
            }
        };
    }, []);

    return (
        <SignalRContext.Provider value={{ connection, isConnected }}>
            {children}
        </SignalRContext.Provider>
    );
};

// Hook để gọi ở các Component khác
export const useSignalR = () => {
    return useContext(SignalRContext);
};