import { requireAdmin } from "@/lib/guards";
import { clientService } from "@/server/services/client.service";
import { success, error } from "@/lib/api-response";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const client = await clientService.findById(id);
    const rawPassword = await clientService.regeneratePassword(client.userId);
    return success({ rawPassword }, "Contraseña regenerada correctamente");
  } catch (e) {
    return error(e, "Error al regenerar contraseña");
  }
}
