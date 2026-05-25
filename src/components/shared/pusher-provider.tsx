"use client";
import { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from "react";
import Pusher from "pusher-js";
import { useSession } from "next-auth/react";

interface PusherContextType {
  pusher: Pusher | null;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  connected: boolean;
}

const PusherContext = createContext<PusherContextType>({
  pusher: null,
  subscribe: () => {},
  unsubscribe: () => {},
  connected: false,
});

export function PusherProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const pusherRef = useRef<Pusher | null>(null);
  const channelsRef = useRef<Set<string>>(new Set());
  const readyRef = useRef(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (readyRef.current) return;

    readyRef.current = true;
    const p = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "dev-key", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
      authEndpoint: "/api/pusher/auth",
      auth: {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
    });

    p.connection.bind("connected", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Pusher] Connected");
      }
    });

    p.connection.bind("disconnected", () => {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Pusher] Disconnected — reconnecting...");
      }
    });

    p.connection.bind("error", (err: unknown) => {
      console.error("[Pusher] Connection error:", err);
    });

    pusherRef.current = p;

    return () => {
      channelsRef.current.clear();
      readyRef.current = false;
      p.disconnect();
      pusherRef.current = null;
    };
  }, [session?.user?.id]);

  const subscribe = useCallback((channel: string) => {
    const p = pusherRef.current;
    if (!p || channelsRef.current.has(channel)) return;
    p.subscribe(channel);
    channelsRef.current.add(channel);
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    const p = pusherRef.current;
    if (!p) return;
    p.unsubscribe(channel);
    channelsRef.current.delete(channel);
  }, []);

  return (
    <PusherContext.Provider
      value={{
        pusher: pusherRef.current,
        subscribe,
        unsubscribe,
        connected: pusherRef.current?.connection?.state === "connected",
      }}
    >
      {children}
    </PusherContext.Provider>
  );
}

export function usePusher() {
  return useContext(PusherContext);
}
