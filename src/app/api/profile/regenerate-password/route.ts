import { requireAuth } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/api-response";
import bcrypt from "bcryptjs";
import { dbLogger } from "@/lib/logger";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 10; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
  return pw;
}

export async function POST() {
  try {
    const user = await requireAuth();

    const rawPassword = generatePassword();
    const hashedPassword = bcrypt.hashSync(rawPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    dbLogger.info({ userId: user.id }, "Contraseña regenerada");

    return success({ rawPassword }, "Contraseña regenerada correctamente");
  } catch (e) {
    return error(e, "Error al regenerar contraseña");
  }
}
