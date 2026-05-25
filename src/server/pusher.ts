import Pusher from "pusher";

const required = ["PUSHER_APP_ID", "PUSHER_KEY", "PUSHER_SECRET", "PUSHER_CLUSTER"] as const;
const missing = required.filter((k) => !process.env[k]);

// Hard fail in production server runtime only (skip during next build)
const isProdBuild = process.env.NEXT_PHASE === "phase-production-build";
if (process.env.NODE_ENV === "production" && missing.length > 0 && !isProdBuild) {
  throw new Error(`Pusher config missing: ${missing.join(", ")}`);
}

if (missing.length > 0) {
  console.warn(`[Pusher] Using dev defaults. Missing: ${missing.join(", ")}`);
}

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || "dev-app-id",
  key: process.env.PUSHER_KEY || "dev-key",
  secret: process.env.PUSHER_SECRET || "dev-secret",
  cluster: process.env.PUSHER_CLUSTER || "us2",
  useTLS: true,
});

export const EVENTS = {
  MESSAGE_NEW: "message-new",
  MESSAGE_READ: "message-read",
  TYPING_START: "typing-start",
  TYPING_END: "typing-end",
  NOTIFICATION: "notification",
  NOTIFICATION_COUNT: "notification-count",
  ACTIVITY_NEW: "activity-new",
  PROJECT_UPDATED: "project-updated",
  FILE_UPLOADED: "file-uploaded",
  FILE_DELETED: "file-deleted",
  OFFER_CREATED: "offer-created",
} as const;

export const CHANNELS = {
  project: (id: string) => `private-project-${id}`,
  user: (id: string) => `private-user-${id}`,
  admin: "private-admin",
} as const;

async function safeTrigger(channel: string | string[], event: string, data: Record<string, unknown>) {
  try {
    return await pusherServer.trigger(channel, event, data);
  } catch (e) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[Pusher] Failed to trigger ${event} on ${channel}:`, e);
    }
    return null;
  }
}

export async function triggerProjectEvent(projectId: string, event: string, data: Record<string, unknown>) {
  return safeTrigger(CHANNELS.project(projectId), event, data);
}

export async function triggerUserEvent(userId: string, event: string, data: Record<string, unknown>) {
  return safeTrigger(CHANNELS.user(userId), event, data);
}

export async function triggerAdminEvent(event: string, data: Record<string, unknown>) {
  return safeTrigger(CHANNELS.admin, event, data);
}

export async function triggerProjectUsers(
  projectId: string,
  userIds: string[],
  event: string,
  data: Record<string, unknown>
) {
  const channels = userIds.map((id) => CHANNELS.user(id));
  channels.push(CHANNELS.project(projectId));
  return safeTrigger(channels, event, data);
}

export { pusherServer };
