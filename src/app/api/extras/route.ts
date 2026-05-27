import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { success, created, error } from "@/lib/api-response";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  serviceId: z.string().min(1, "Servicio requerido"),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const serviceId = url.searchParams.get("serviceId");
    const where: Record<string, unknown> = { deletedAt: null };
    if (serviceId) where.serviceId = serviceId;
    const extras = await prisma.extra.findMany({
      where,
      include: { service: { select: { id: true, name: true } } },
      orderBy: [{ service: { order: "asc" } }, { name: "asc" }],
    });
    return success(extras);
  } catch (e) {
    return error(e, "Error al obtener extras");
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = createSchema.parse(body);
    const extra = await prisma.extra.create({
      data: { name: data.name, price: data.price, serviceId: data.serviceId },
      include: { service: { select: { id: true, name: true } } },
    });
    return created(extra, "Extra creado correctamente");
  } catch (e) {
    return error(e, "Error al crear extra");
  }
}
