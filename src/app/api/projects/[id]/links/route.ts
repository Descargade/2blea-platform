import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { success, created, error } from "@/lib/api-response";
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
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = linkSchema.parse(body);

    const link = await prisma.projectLink.create({
      data: { projectId: id, url: data.url, title: data.title },
    });
    return created(link, "Link agregado correctamente");
  } catch (e) {
    return error(e, "Error al agregar link");
  }
}
