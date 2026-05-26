import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { success, error } from "@/lib/api-response";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    await requireAdmin();
    const { id: projectId, paymentId } = await params;

    const payment = await prisma.projectPayment.findFirst({
      where: { id: paymentId, projectId },
    });
    if (!payment) return error(new Error("NotFound"), "Pago no encontrado");

    const project = await prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
    });

    await prisma.projectPayment.delete({ where: { id: paymentId } });

    if (project) {
      const newTotal = Math.max(0, (project.totalPaid ?? 0) - payment.amount);
      await prisma.project.update({ where: { id: projectId }, data: { totalPaid: newTotal } });
    }

    return success({ deleted: true }, "Pago eliminado correctamente");
  } catch (e) {
    return error(e, "Error al eliminar pago");
  }
}
