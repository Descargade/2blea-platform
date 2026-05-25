import { requireAuth } from "@/lib/guards";
import { storage } from "@/server/storage";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) return error(new Error("Archivo requerido"), "No se recibió ningún archivo");
    if (!file.type.startsWith("image/")) return error(new Error("Formato inválido"), "Solo se permiten imágenes");

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > 5 * 1024 * 1024) {
      return error(new Error("Archivo muy grande"), "La imagen no puede superar los 5MB");
    }

    const { url } = await storage.save(buffer, file.name, file.type);

    await prisma.user.update({
      where: { id: user.id },
      data: { image: url },
    });

    return success({ image: url }, "Avatar actualizado correctamente");
  } catch (e) {
    return error(e, "Error al actualizar avatar");
  }
}
