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
import { store } from "@/store/store";
import { refreshToken } from "@/lib/axios";

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  reconnectVersion: number;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
  reconnectVersion: 0,
});

export const SignalRProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuth();
  const reconnectAttemptRef = useRef(0);

  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectVersion, setReconnectVersion] = useState(0);

  useEffect(() => {
    if (Cookies.get("isLoggedIn") === "false" || !isAuthenticated) {
      return;
    }

    let isStopped = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const hubUrl = `${process.env.NEXT_PUBLIC_API_URL}/hubs/app`;

    const buildConnection = () => {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: async () => store.getState().auth.accessToken ?? "",
          withCredentials: true,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .build();

      conn.onreconnecting(() => {
        setIsConnected(false);
        refreshToken().catch(() => {});
      });

      conn.onreconnected(() => {
        setIsConnected(true);
        setReconnectVersion((v) => v + 1);
        reconnectAttemptRef.current = 0;
      });

      conn.onclose(() => {
        setIsConnected(false);
      });

      return conn;
    };

    const startConnection = async (conn: signalR.HubConnection) => {
      try {
        await conn.start();
        if (!isStopped) {
          setIsConnected(true);
          setConnection(conn);
          setReconnectVersion((v) => v + 1);
          reconnectAttemptRef.current = 0;
        } else {
          await conn.stop();
        }
      } catch (error) {
        if (!isStopped) {
          console.error("SignalR: Start failed", error);
          reconnectAttemptRef.current += 1;
          if (reconnectAttemptRef.current <= 3) {
            try {
              await refreshToken();
            } catch {
              // refresh failed, will retry with delay
            }
            reconnectTimer = setTimeout(() => {
              if (!isStopped) {
                startConnection(buildConnection());
              }
            }, reconnectAttemptRef.current * 3000);
          }
        }
      }
    };

    const conn = buildConnection();
    startConnection(conn);

    return () => {
      isStopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      void conn.stop();
      setConnection(null);
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  return (
    <SignalRContext.Provider value={{ connection, isConnected, reconnectVersion }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => useContext(SignalRContext);
