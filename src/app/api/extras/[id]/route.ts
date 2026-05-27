import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  serviceId: z.string().min(1).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.serviceId !== undefined) updateData.serviceId = data.serviceId;
    const extra = await prisma.extra.update({
      where: { id },
      data: updateData,
      include: { service: { select: { id: true, name: true } } },
    });
    return success(extra, "Extra actualizado correctamente");
  } catch (e) {
    return error(e, "Error al actualizar extra");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.extra.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return success({ deleted: true }, "Extra eliminado correctamente");
  } catch (e) {
    return error(e, "Error al eliminar extra");
  }
}
