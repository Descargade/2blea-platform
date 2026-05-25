"use client";
import { useEffect, useState } from "react";
import { usePusher } from "./pusher-provider";
import { Wifi, WifiOff } from "lucide-react";

export function RealtimeStatus() {
  const { pusher } = usePusher();
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (!pusher) return;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    pusher.connection.bind("connected", onConnect);
    pusher.connection.bind("disconnected", onDisconnect);
    pusher.connection.bind("state_change", (states: { current: string }) => {
      setConnected(states.current === "connected");
    });

    setConnected(pusher.connection.state === "connected");

    return () => {
      pusher.connection.unbind("connected", onConnect);
      pusher.connection.unbind("disconnected", onDisconnect);
    };
  }, [pusher]);

  if (connected) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-xl animate-slide-up">
      <WifiOff className="w-4 h-4 text-red-400" />
      <span className="text-sm text-red-400">Reconectando...</span>
      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
    </div>
  );
}
