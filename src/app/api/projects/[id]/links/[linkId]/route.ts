import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { success, error } from "@/lib/api-response";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    await requireAdmin();
    const { linkId } = await params;
    await prisma.projectLink.delete({ where: { id: linkId } });
    return success({ deleted: true }, "Link eliminado correctamente");
  } catch (e) {
    return error(e, "Error al eliminar link");
  }
}
