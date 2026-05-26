import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { success, created, error } from "@/lib/api-response";
import { z } from "zod";

const paymentSchema = z.object({
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  note: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = paymentSchema.parse(body);

    const payment = await prisma.projectPayment.create({
      data: {
        projectId: id,
        amount: data.amount,
        note: data.note || null,
      },
    });

    const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
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
    }

    return created(payment, "Pago registrado correctamente");
  } catch (e) {
    return error(e, "Error al registrar pago");
  }
}
