import { requireAdmin } from "@/lib/guards";
import { offerService } from "@/server/services/offer.service";
import { offerCreateSchema } from "@/lib/validations";
import { success, created, error } from "@/lib/api-response";

export async function GET() {
  try {
    const offers = await offerService.findAll();
    return success(offers);
  } catch (e) {
    return error(e);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = offerCreateSchema.parse(body);
    const offer = await offerService.create(data);
    return created(offer, "Oferta creada correctamente");
  } catch (e) {
    return error(e, "Error al crear oferta");
  }
}
