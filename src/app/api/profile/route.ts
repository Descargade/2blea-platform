import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    if (data.name) updateData.name = data.name;

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== user.id) {
        return error(new Error("Email en uso"), "Este email ya está registrado");
      }
      updateData.email = data.email;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        return error(new Error("Contraseña actual requerida"), "Debes ingresar tu contraseña actual");
      }
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) return error(new Error("NotFound"), "Usuario no encontrado");

      const valid = await bcrypt.compare(data.currentPassword, dbUser.password);
      if (!valid) return error(new Error("Contraseña incorrecta"), "La contraseña actual no es correcta");

      updateData.password = await bcrypt.hash(data.newPassword, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return error(new Error("Sin cambios"), "No hay datos para actualizar");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, image: true },
    });

    return success(updated, "Perfil actualizado correctamente");
  } catch (e) {
    return error(e, "Error al actualizar perfil");
  }
}

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true, image: true, phone: true },
    });
    return success(profile);
  } catch (e) {
    return error(e, "Error al obtener perfil");
  }
}
