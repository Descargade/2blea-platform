import { requireAdmin } from "@/lib/guards";
import { offerService } from "@/server/services/offer.service";
import { success, error } from "@/lib/api-response";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await offerService.softDelete(id);
    return success({ deleted: true }, "Oferta eliminada correctamente");
  } catch (e) {
    return error(e, "Error al eliminar oferta");
  }
}
