import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });
    if (!notification) {
      return error(new Error("NotFound"), "Notificación no encontrada");
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return success(updated, "Notificación marcada como leída");
  } catch (e) {
    return error(e, "Error al actualizar notificación");
  }
}
