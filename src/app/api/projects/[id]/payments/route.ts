import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { success, created, error } from "@/lib/api-response";
import { pusherServer, CHANNELS, EVENTS } from "@/server/pusher";
import { paymentCreateSchema } from "@/lib/validations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = paymentCreateSchema.parse(body);

    const payment = await prisma.projectPayment.create({
      data: {
        projectId: id,
        type: data.type ?? "GENERAL",
        amount: data.amount,
        status: "PAID",
        note: data.note || null,
      },
    });

    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { client: { select: { userId: true } } },
    });
    if (project) {
      const newTotal = (project.totalPaid ?? 0) + data.amount;
      await prisma.project.update({ where: { id }, data: { totalPaid: newTotal } });

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          projectId: id,
          action: "PAYMENT_REGISTERED",
          details: `Pago de $${data.amount} registrado${data.note ? `: ${data.note}` : ""}`,
        },
      });

      try {
        const channels = [CHANNELS.project(id), CHANNELS.user(project.client.userId)];
        await pusherServer.trigger(channels, EVENTS.PROJECT_UPDATED, {
          projectId: id,
          projectName: project.name,
          totalPaid: newTotal,
          amount: data.amount,
          userId: user.id,
        });
      } catch { /* silent */ }
    }

    return created(payment, "Pago registrado correctamente");
  } catch (e) {
    return error(e, "Error al registrar pago");
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: projectId } = await params;
    const { paymentId, status } = await req.json();

    const payment = await prisma.projectPayment.update({
      where: { id: paymentId, projectId },
      data: { status },
    });

    return success(payment, "Estado de pago actualizado");
  } catch (e) {
    return error(e, "Error al actualizar pago");
  }
}
