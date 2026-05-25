import { requireAdmin } from "@/lib/guards";
import { clientService } from "@/server/services/client.service";
import { success, error } from "@/lib/api-response";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await clientService.softDelete(id);
    return success({ deleted: true }, "Cliente eliminado correctamente");
  } catch (e) {
    return error(e, "Error al eliminar cliente");
  }
}
