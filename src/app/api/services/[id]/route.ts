import { requireAdmin } from "@/lib/guards";
import { serviceService } from "@/server/services/service.service";
import { success, error } from "@/lib/api-response";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await serviceService.softDelete(id);
    return success({ deleted: true }, "Servicio eliminado correctamente");
  } catch (e) {
    return error(e, "Error al eliminar servicio");
  }
}
