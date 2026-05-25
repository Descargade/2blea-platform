import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;

    if (user.role === "CLIENTE") {
      const client = await prisma.client.findUnique({ where: { userId: user.id } });
      if (client) {
        where.project = { clientId: client.id };
      } else {
        return success([]);
      }
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return success(logs);
  } catch (e) {
    return error(e, "Error al cargar actividad");
  }
}
