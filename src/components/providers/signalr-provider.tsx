"use client";

import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./auth-provider";

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
});

export const SignalRProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accessToken, isAuthenticated } = useAuth();
  const accessTokenRef = useRef<string | null>(accessToken);

  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    if (Cookies.get("isLoggedIn") === "false" || !isAuthenticated) {
      return;
    }

    let isStopped = false;
    const hubUrl = `${process.env.NEXT_PUBLIC_API_URL}/hubs/app`;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: async () => accessTokenRef.current ?? "",
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
          // Connected
        } else {
          await newConnection.stop();
        }
      } catch (error) {
        if (!isStopped) {
          console.error("SignalR: Start failed", error);
        }
      }
    };

    start();

    return () => {
      isStopped = true;
      void newConnection.stop();
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
