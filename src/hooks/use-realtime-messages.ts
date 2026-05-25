"use client";
import { useEffect, useCallback, useState, useRef } from "react";
import { usePusher } from "@/components/shared/pusher-provider";

interface RealtimeMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: { name: string; image?: string | null };
}

interface TypingUser {
  userId: string;
  name: string;
  timestamp: number;
}

export function useRealtimeMessages(conversationId: string, onMessage: (msg: RealtimeMessage) => void) {
  const { pusher } = usePusher();
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!pusher || !conversationId) return;

    const channelName = `private-conversation-${conversationId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("message-new", (data: RealtimeMessage) => {
      handlerRef.current(data);
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [pusher, conversationId]);
}

export function useRealtimeTyping(conversationId: string, currentUserId: string) {
  const { pusher } = usePusher();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!pusher || !conversationId) return;

    const channelName = `private-conversation-${conversationId}`;
    const channel = pusher.subscribe(channelName);

    const onStart = (data: { userId: string; name: string }) => {
      if (data.userId === currentUserId) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId)) return prev;
        return [...prev, { ...data, timestamp: Date.now() }];
      });

      const existing = timersRef.current.get(data.userId);
      if (existing) clearTimeout(existing);
      timersRef.current.set(data.userId, setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        timersRef.current.delete(data.userId);
      }, 3000));
    };

    const onEnd = (data: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      const existing = timersRef.current.get(data.userId);
      if (existing) { clearTimeout(existing); timersRef.current.delete(data.userId); }
    };

    channel.bind("typing-start", onStart);
    channel.bind("typing-end", onEnd);

    return () => {
      pusher.unsubscribe(channelName);
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [pusher, conversationId, currentUserId]);

  const emitTyping = useCallback(async (isTyping: boolean) => {
    if (!pusher || !conversationId) return;
    const event = isTyping ? "typing-start" : "typing-end";
    await fetch("/api/pusher/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, event }),
    });
  }, [pusher, conversationId]);

  return { typingUsers, emitTyping };
}
