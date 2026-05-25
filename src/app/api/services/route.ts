import { requireAdmin } from "@/lib/guards";
import { serviceService } from "@/server/services/service.service";
import { serviceUpdateSchema } from "@/lib/validations";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    const services = await serviceService.findAll();
    return success(services);
  } catch (e) {
    return error(e);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = serviceUpdateSchema.parse(body);
    const service = await serviceService.update(data);
    return success(service, "Servicio actualizado correctamente");
  } catch (e) {
    return error(e, "Error al actualizar servicio");
  }
}
