"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePusher } from "@/components/shared/pusher-provider";

interface TypingUser {
  userId: string;
  name: string;
  timestamp: number;
}

export function useConversationTyping(conversationId: string, currentUserId: string, projectId?: string | null) {
  const { pusher } = usePusher();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const channelName = projectId ? `private-project-${projectId}` : "";

  useEffect(() => {
    if (!pusher || !channelName || !conversationId) return;

    const channel = pusher.subscribe(channelName);

    const onStart = (data: { userId: string; name: string; conversationId: string }) => {
      if (data.conversationId !== conversationId || data.userId === currentUserId) return;
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, name: data.name, timestamp: Date.now() }];
      });
      const existing = timersRef.current.get(data.userId);
      if (existing) clearTimeout(existing);
      timersRef.current.set(data.userId, setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
        timersRef.current.delete(data.userId);
      }, 4000));
    };

    const onEnd = (data: { userId: string; conversationId: string }) => {
      if (data.conversationId !== conversationId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      const existing = timersRef.current.get(data.userId);
      if (existing) { clearTimeout(existing); timersRef.current.delete(data.userId); }
    };

    channel.bind("typing-start", onStart);
    channel.bind("typing-end", onEnd);

    return () => {
      channel.unbind("typing-start", onStart);
      channel.unbind("typing-end", onEnd);
      pusher.unsubscribe(channelName);
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [pusher, channelName, conversationId, currentUserId]);

  const emitTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId) return;
    try {
      const event = isTyping ? "typing-start" : "typing-end";
      await fetch("/api/pusher/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, event }),
      });
    } catch {
      // silently fail
    }
  }, [conversationId]);

  return { typingUsers, emitTyping };
}
