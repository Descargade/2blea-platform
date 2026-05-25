import { requireAdmin } from "@/lib/guards";
import { clientService } from "@/server/services/client.service";
import { clientCreateSchema } from "@/lib/validations";
import { success, created, error } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const clients = await clientService.findAll();
    return success(clients);
  } catch (e) {
    return error(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = clientCreateSchema.parse(body);
    const client = await clientService.create(data);
    return created(client, "Cliente creado correctamente");
  } catch (e) {
    return error(e, "Error al crear cliente");
  }
}
