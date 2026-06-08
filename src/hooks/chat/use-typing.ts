import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useSignalR } from "@/components/providers/signalr-provider";
import { TypingEventPayload } from "@/types/chat";

export function useTyping(
  conversationId: string | null | undefined,
  onTypingChange: (typers: Map<string, TypingEventPayload>) => void,
) {
  const { connection, isConnected } = useSignalR();
  const { user } = useAuth();

  const typersRef = useRef<Map<string, TypingEventPayload>>(new Map());
  const lastSentTypingRef = useRef<number>(0);
  const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCurrentlyTypingRef = useRef(false);

  useEffect(() => {
    if (!isConnected || !connection || !conversationId) {
      return;
    }

    void connection.invoke("JoinConversation", conversationId).catch((error: unknown) => {
      console.error("[useTyping] JoinConversation failed:", error);
    });

    return () => {
      if (isCurrentlyTypingRef.current) {
        void connection.invoke("SendTyping", conversationId, false).catch(() => {});
      }

      void connection.invoke("LeaveConversation", conversationId).catch((error: unknown) => {
        console.error("[useTyping] LeaveConversation failed:", error);
      });
    };
  }, [connection, conversationId, isConnected]);

  useEffect(() => {
    if (!isConnected || !connection || !conversationId) {
      return;
    }

    const handleUserTyping = (payload: TypingEventPayload) => {
      if (payload.conversationId !== conversationId) {
        return;
      }

      const nextTypers = new Map(typersRef.current);

      if (payload.isTyping) {
        nextTypers.set(payload.userId, payload);
      } else {
        nextTypers.delete(payload.userId);
      }

      typersRef.current = nextTypers;
      onTypingChange(new Map(nextTypers));
    };

    connection.on("UserTyping", handleUserTyping);

    return () => {
      connection.off("UserTyping", handleUserTyping);
    };
  }, [connection, conversationId, isConnected, onTypingChange]);

  useEffect(() => {
    typersRef.current = new Map();
    onTypingChange(new Map());
  }, [conversationId, onTypingChange]);

  const sendTypingSignal = useCallback(
    (isTyping: boolean) => {
      if (!connection || !isConnected || !conversationId) {
        return;
      }

      const typingPayload: TypingEventPayload = {
        userId: user?.id || "",
        displayName: user?.displayName || "",
        username: user?.username || "",
        avatarUrl: user?.avatarUrl || "",
        conversationId,
        isTyping,
        timestamp: new Date().toISOString(),
      };

      void connection
        .invoke("SendTyping", conversationId, typingPayload, isTyping)
        .catch((error: unknown) => {
          console.error("[useTyping] SendTyping failed:", error);
        });
    },
    [
      connection,
      conversationId,
      isConnected,
      user?.avatarUrl,
      user?.displayName,
      user?.id,
      user?.username,
    ],
  );

  const notifyTyping = useCallback(() => {
    const now = Date.now();

    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
    }

    if (
      !isCurrentlyTypingRef.current ||
      now - lastSentTypingRef.current > 3000
    ) {
      isCurrentlyTypingRef.current = true;
      lastSentTypingRef.current = now;
      sendTypingSignal(true);
    }

    stopTypingTimerRef.current = setTimeout(() => {
      isCurrentlyTypingRef.current = false;
      sendTypingSignal(false);
    }, 1500);
  }, [sendTypingSignal]);

  const notifyStopTyping = useCallback(() => {
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
    }

    if (isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = false;
      sendTypingSignal(false);
    }
  }, [sendTypingSignal]);

  return { notifyTyping, notifyStopTyping };
}
