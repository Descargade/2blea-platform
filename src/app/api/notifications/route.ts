import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

    const where: Record<string, unknown> = { userId: user.id };
    if (unreadOnly) where.read = false;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
    ]);

    return success({ notifications, unreadCount });
  } catch (e) {
    return error(e, "Error al cargar notificaciones");
  }
}
