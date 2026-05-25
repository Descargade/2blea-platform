import { budgetService } from "@/server/services/budget.service";
import { budgetCreateSchema } from "@/lib/validations";
import { success, error } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = budgetCreateSchema.parse(body);
    await budgetService.create(data);
    return success({ received: true }, "Presupuesto recibido correctamente");
  } catch (e) {
    return error(e, "Error al procesar el presupuesto");
  }
}
