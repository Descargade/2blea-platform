import { prisma } from "@/lib/prisma";
import type { MessageCreateInput } from "@/lib/validations";
import { dbLogger } from "@/lib/logger";

export const messageService = {
  async findConversations(userId: string, role: string) {
    dbLogger.debug({ userId, role }, "Buscando conversaciones");
    if (role === "ADMIN") {
      return prisma.conversation.findMany({
        where: { deletedAt: null },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          client: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          project: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    }
    const client = await prisma.client.findUnique({ where: { userId } });
    if (!client) return [];
    return prisma.conversation.findMany({
      where: { clientId: client.id, deletedAt: null },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async createMessage(data: MessageCreateInput, senderId: string) {
    const msg = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId,
        content: data.content,
      },
    });
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });
    dbLogger.info({ conversationId: data.conversationId }, "Mensaje creado");
    return msg;
  },
};
