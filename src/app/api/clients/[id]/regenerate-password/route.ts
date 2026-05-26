import { requireAdmin } from "@/lib/guards";
import { clientService } from "@/server/services/client.service";
import { success, error } from "@/lib/api-response";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const client = await clientService.findById(id);
    const { rawPassword, email } = await clientService.getPassword(client.userId);
    return success({ rawPassword, email }, "Contraseña obtenida");
  } catch (e) {
    return error(e, "Error al obtener contraseña");
  }
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const client = await clientService.findById(id);
    const rawPassword = await clientService.regeneratePassword(client.userId);
    return success({ rawPassword }, "Contraseña regenerada correctamente");
  } catch (e) {
    return error(e, "Error al regenerar contraseña");
  }
}
