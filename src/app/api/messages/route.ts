import { requireAuth } from "@/lib/guards";
import { messageService } from "@/server/services/message.service";
import { messageCreateSchema } from "@/lib/validations";
import { success, created, error } from "@/lib/api-response";
import { pusherServer, CHANNELS, EVENTS } from "@/server/pusher";
import { prisma } from "@/lib/prisma";
import { activity } from "@/lib/activity";

export async function GET() {
  try {
    const user = await requireAuth();
    const conversations = await messageService.findConversations(user.id, user.role);
    return success(conversations);
  } catch (e) {
    return error(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = messageCreateSchema.parse(body);
    const msg = await messageService.createMessage(data, user.id);

    // Notifications + activity
    try {
      await activity.messageSent(data.conversationId, null, user.id, data.content);
    } catch { /* silent */ }

    // Realtime: trigger message event
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: data.conversationId },
        include: { client: { include: { user: { select: { id: true } } } } },
      });

      const channels: string[] = [];
      if (conversation?.projectId) {
        channels.push(CHANNELS.project(conversation.projectId));
      }
      if (user.role === "ADMIN") {
        if (conversation?.client?.user?.id) {
          channels.push(CHANNELS.user(conversation.client.user.id));
        }
      } else {
        channels.push(CHANNELS.admin);
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN", deletedAt: null },
          select: { id: true },
        });
        admins.forEach((a) => channels.push(CHANNELS.user(a.id)));
      }

      if (channels.length > 0) {
        await pusherServer.trigger(channels, EVENTS.MESSAGE_NEW, {
          ...msg,
          sender: { id: user.id, name: user.name, image: user.image },
        });
      }
    } catch { /* Pusher fail silently */ }

    return created(msg, "Mensaje enviado");
  } catch (e) {
    return error(e, "Error al enviar mensaje");
  }
}
