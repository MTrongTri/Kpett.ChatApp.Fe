"use client";

import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-provider";

interface SignalRContextType {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
}

const SignalRContext = createContext<SignalRContextType>({
    connection: null,
    isConnected: false,
});

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
    const { accessToken, isAuthenticated } = useAuth();

    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);


    useEffect(() => {
        if (Cookies.get("isLoggedIn") === "false" || !isAuthenticated) return;

        let isStopped = false;
        const hubUrl = `${process.env.NEXT_PUBLIC_API_URL}/chat-Hub`;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: async () => {
                    return accessToken ?? "";
                },
                withCredentials: true,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .build();

        newConnection.onreconnecting(() => setIsConnected(false));
        newConnection.onreconnected(() => setIsConnected(true));
        newConnection.onclose(() => setIsConnected(false));

        const start = async () => {
            try {
                await newConnection.start();
                if (!isStopped) {
                    setIsConnected(true);
                    setConnection(newConnection);
                    console.log("SignalR: Connected successfully!");
                } else {
                    await newConnection.stop();
                }
            } catch (err) {
                if (!isStopped) {
                    console.error("SignalR: Start failed", err);
                }
            }
        };

        start();

        return () => {
            isStopped = true;
            newConnection.stop();
            setConnection(null);
            setIsConnected(false);
        };
    }, [isAuthenticated]);

    return (
        <SignalRContext.Provider value={{ connection, isConnected }}>
            {children}
        </SignalRContext.Provider>
    );
};

export const useSignalR = () => useContext(SignalRContext);