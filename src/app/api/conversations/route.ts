import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { success, created, error } from "@/lib/api-response";
import { NotFoundError } from "@/lib/app-error";
import { dbLogger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (user.role === "ADMIN") {
      const { clientId } = body;
      if (!clientId) return error(new Error("clientId es requerido"), "Error al crear conversación");

      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) throw new NotFoundError("Cliente no encontrado");

      const existing = await prisma.conversation.findFirst({
        where: { clientId, deletedAt: null },
      });
      if (existing) return success(existing);

      const conversation = await prisma.conversation.create({
        data: { clientId, adminId: user.id },
        include: {
          client: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          project: { select: { id: true, name: true } },
        },
      });
      dbLogger.info({ conversationId: conversation.id }, "Conversación creada por admin");
      return created(conversation);
    }

    const client = await prisma.client.findUnique({ where: { userId: user.id } });
    if (!client) throw new NotFoundError("Cliente no encontrado");

    const existing = await prisma.conversation.findFirst({
      where: { clientId: client.id, deletedAt: null },
    });
    if (existing) return success(existing);

    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN", deletedAt: null },
      orderBy: { createdAt: "asc" },
    });

    const conversation = await prisma.conversation.create({
      data: { clientId: client.id, adminId: admin?.id },
      include: {
        client: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        project: { select: { id: true, name: true } },
      },
    });
    dbLogger.info({ conversationId: conversation.id }, "Conversación creada por cliente");
    return created(conversation);
  } catch (e) {
    return error(e, "Error al crear conversación");
  }
}
