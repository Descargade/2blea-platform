"use client";
import { useSession } from "next-auth/react";
import { useRealtimeMessages, useRealtimeNotifications } from "@/hooks/use-realtime";

export function RealtimeSubscriber() {
  const { data: session } = useSession();

  useRealtimeMessages(session?.user?.id ?? "", session?.user?.role ?? "");
  useRealtimeNotifications(session?.user?.id ?? "");

  return null;
}
