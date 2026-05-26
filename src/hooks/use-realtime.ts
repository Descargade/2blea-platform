"use client";
import { useEffect, useRef } from "react";
import { usePusher } from "@/components/shared/pusher-provider";
import { useQueryClient } from "@tanstack/react-query";

export interface RealtimeMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender?: { name: string; image?: string | null };
}

interface RealtimeNotification {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

interface RealtimeActivity {
  id: string;
  action: string;
  details?: string | null;
  userId?: string | null;
  projectId?: string | null;
  createdAt: string;
  user?: { id: string; name: string } | null;
  project?: { id: string; name: string } | null;
}

type ToastHandler = (notification: RealtimeNotification) => void;
type MessageHandler = (message: RealtimeMessage) => void;
type ActivityHandler = (activity: RealtimeActivity) => void;

export function useRealtimeProject(projectId: string, userId: string) {
  const { pusher, subscribe, unsubscribe } = usePusher();
  const qc = useQueryClient();
  const channel = `private-project-${projectId}`;
  const subRef = useRef(subscribe);
  const unsubRef = useRef(unsubscribe);
  useEffect(() => { subRef.current = subscribe; });
  useEffect(() => { unsubRef.current = unsubscribe; });

  useEffect(() => {
    if (!pusher || !projectId) return;
    subRef.current(channel);
    return () => unsubRef.current(channel);
  }, [pusher, projectId, channel]);

  useEffect(() => {
    if (!pusher || !projectId) return;
    const ch = pusher.channel(channel);
    if (!ch) return;

    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["project-files", projectId] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    };

    ch.bind("project-updated", invalidate);
    ch.bind("file-uploaded", invalidate);
    ch.bind("file-deleted", invalidate);
    ch.bind("activity-new", invalidate);

    return () => {
      ch.unbind("project-updated", invalidate);
      ch.unbind("file-uploaded", invalidate);
      ch.unbind("file-deleted", invalidate);
      ch.unbind("activity-new", invalidate);
    };
  }, [pusher, projectId, channel, qc]);
}

export function useRealtimeNotifications(
  userId: string,
  onNotification?: ToastHandler,
  onCount?: (count: number) => void
) {
  const { pusher, subscribe, unsubscribe } = usePusher();
  const qc = useQueryClient();
  const notifRef = useRef(onNotification);
  const countRef = useRef(onCount);
  const subRef = useRef(subscribe);
  const unsubRef = useRef(unsubscribe);
  useEffect(() => { subRef.current = subscribe; });
  useEffect(() => { unsubRef.current = unsubscribe; });

  useEffect(() => { notifRef.current = onNotification; });
  useEffect(() => { countRef.current = onCount; });

  const channel = `private-user-${userId}`;

  useEffect(() => {
    if (!pusher || !userId) return;
    subRef.current(channel);
    return () => unsubRef.current(channel);
  }, [pusher, userId, channel]);

  useEffect(() => {
    if (!pusher || !userId) return;
    const ch = pusher.channel(channel);
    if (!ch) return;

    const onNotif = (data: RealtimeNotification) => {
      notifRef.current?.(data);
      qc.invalidateQueries({ queryKey: ["notifications"] });
    };

    const onCountEvent = (data: { count: number }) => {
      countRef.current?.(data.count);
    };

    ch.bind("notification", onNotif);
    ch.bind("notification-count", onCountEvent);

    return () => {
      ch.unbind("notification", onNotif);
      ch.unbind("notification-count", onCountEvent);
    };
  }, [pusher, userId, channel, qc]);
}

export function useRealtimeMessages(
  userId: string,
  role: string,
  onMessage?: MessageHandler
) {
  const { pusher, subscribe, unsubscribe } = usePusher();
  const qc = useQueryClient();
  const msgRef = useRef(onMessage);
  const subRef = useRef(subscribe);
  const unsubRef = useRef(unsubscribe);
  useEffect(() => { subRef.current = subscribe; });
  useEffect(() => { unsubRef.current = unsubscribe; });

  useEffect(() => { msgRef.current = onMessage; });

  const channel = role === "ADMIN" ? "private-admin" : `private-user-${userId}`;

  useEffect(() => {
    if (!pusher || !userId) return;
    subRef.current(channel);
    return () => unsubRef.current(channel);
  }, [pusher, userId, channel]);

  useEffect(() => {
    if (!pusher || !userId) return;
    const ch = pusher.channel(channel);
    if (!ch) return;

    const handler = (data: RealtimeMessage) => {
      msgRef.current?.(data);
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    };

    ch.bind("message-new", handler);
    return () => { ch.unbind("message-new", handler); };
  }, [pusher, userId, channel, qc]);
}

export function useRealtimeProjectUpdates(userId: string) {
  const { pusher, subscribe, unsubscribe } = usePusher();
  const qc = useQueryClient();
  const subRef = useRef(subscribe);
  const unsubRef = useRef(unsubscribe);
  useEffect(() => { subRef.current = subscribe; });
  useEffect(() => { unsubRef.current = unsubscribe; });

  const channel = `private-user-${userId}`;

  useEffect(() => {
    if (!pusher || !userId) return;
    subRef.current(channel);
    return () => unsubRef.current(channel);
  }, [pusher, userId, channel]);

  useEffect(() => {
    if (!pusher || !userId) return;
    const ch = pusher.channel(channel);
    if (!ch) return;

    const invalidateProjects = () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["project"] });
    };

    ch.bind("project-updated", invalidateProjects);
    ch.bind("file-uploaded", invalidateProjects);
    ch.bind("file-deleted", invalidateProjects);

    return () => {
      ch.unbind("project-updated", invalidateProjects);
      ch.unbind("file-uploaded", invalidateProjects);
      ch.unbind("file-deleted", invalidateProjects);
    };
  }, [pusher, userId, channel, qc]);
}

export function useRealtimeActivity(
  projectId: string | undefined,
  onActivity?: ActivityHandler
) {
  const { pusher, subscribe, unsubscribe } = usePusher();
  const qc = useQueryClient();
  const actRef = useRef(onActivity);
  const subRef = useRef(subscribe);
  const unsubRef = useRef(unsubscribe);
  useEffect(() => { subRef.current = subscribe; });
  useEffect(() => { unsubRef.current = unsubscribe; });

  useEffect(() => { actRef.current = onActivity; });

  const channel = projectId ? `private-project-${projectId}` : "";

  useEffect(() => {
    if (!pusher || !channel) return;
    subRef.current(channel);
    return () => unsubRef.current(channel);
  }, [pusher, channel]);

  useEffect(() => {
    if (!pusher || !channel) return;
    const ch = pusher.channel(channel);
    if (!ch) return;

    const handler = (data: RealtimeActivity) => {
      actRef.current?.(data);
      qc.invalidateQueries({ queryKey: ["activity"] });
    };

    ch.bind("activity-new", handler);
    return () => { ch.unbind("activity-new", handler); };
  }, [pusher, channel, qc]);
}
