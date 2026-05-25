import { prisma } from "@/lib/prisma";
import { pusherServer, CHANNELS, EVENTS } from "@/server/pusher";

type NotificationType = "NEW_MESSAGE" | "FILE_UPLOADED" | "PROJECT_UPDATED" | "PROGRESS_UPDATED" | "OFFER_CREATED";

export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
}) {
  const notification = await prisma.notification.create({ data });

  try {
    await pusherServer.trigger(CHANNELS.user(data.userId), EVENTS.NOTIFICATION, notification);
    const count = await prisma.notification.count({ where: { userId: data.userId, read: false } });
    await pusherServer.trigger(CHANNELS.user(data.userId), EVENTS.NOTIFICATION_COUNT, { count });
  } catch { /* silent */ }

  return notification;
}

export async function notifyProjectUsers(projectId: string, notification: {
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  excludeUserId?: string;
}) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      conversations: { include: { messages: { take: 1, orderBy: { createdAt: "desc" }, select: { senderId: true } } } },
      client: { include: { user: { select: { id: true } } } },
    },
  });
  if (!project) return;

  const adminUsers = await prisma.user.findMany({ where: { role: "ADMIN", deletedAt: null } });
  const userIds = new Set<string>();

  adminUsers.forEach((u) => userIds.add(u.id));
  if (project.client?.user?.id) userIds.add(project.client.user.id);
  if (notification.excludeUserId) userIds.delete(notification.excludeUserId);

  await prisma.notification.createMany({
    data: Array.from(userIds).map((userId) => ({
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message || null,
      link: notification.link || null,
    })),
  });
}

export async function createActivity(data: {
  userId?: string;
  projectId?: string;
  action: string;
  details?: string;
}) {
  return prisma.activityLog.create({ data });
}
