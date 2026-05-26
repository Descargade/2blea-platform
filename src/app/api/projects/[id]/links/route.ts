import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { success, created, error } from "@/lib/api-response";
import { pusherServer, CHANNELS, EVENTS } from "@/server/pusher";
import { z } from "zod";

const linkSchema = z.object({
  url: z.string().url("URL inválida"),
  title: z.string().min(1, "El título es requerido"),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const links = await prisma.projectLink.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return success(links);
  } catch (e) {
    return error(e);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = linkSchema.parse(body);

    const link = await prisma.projectLink.create({
      data: { projectId: id, url: data.url, title: data.title },
    });

    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      select: { name: true, client: { select: { userId: true } } },
    });

    if (project) {
      try {
        const channels = [CHANNELS.project(id), CHANNELS.user(project.client.userId)];
        await pusherServer.trigger(channels, EVENTS.PROJECT_UPDATED, {
          projectId: id,
          projectName: project.name,
          link: { title: data.title, url: data.url },
          userId: user.id,
        });
      } catch { /* silent */ }
    }

    return created(link, "Link agregado correctamente");
  } catch (e) {
    return error(e, "Error al agregar link");
  }
}
