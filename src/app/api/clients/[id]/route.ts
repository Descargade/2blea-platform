import { requireAdmin } from "@/lib/guards";
import { clientService } from "@/server/services/client.service";
import { clientUpdateSchema } from "@/lib/validations";
import { success, error } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const client = await clientService.findById(id);
    return success(client);
  } catch (e) {
    return error(e, "Error al obtener cliente");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = clientUpdateSchema.parse(body);
    const client = await clientService.update(id, data);
    return success(client, "Cliente actualizado correctamente");
  } catch (e) {
    return error(e, "Error al actualizar cliente");
  }
}

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
