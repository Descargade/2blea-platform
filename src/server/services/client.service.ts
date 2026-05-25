import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { ClientCreateInput } from "@/lib/validations";
import { NotFoundError, ConflictError } from "@/lib/app-error";
import { dbLogger } from "@/lib/logger";

export const clientService = {
  async findAll() {
    dbLogger.debug("Buscando todos los clientes");
    return prisma.client.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: ClientCreateInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError("El email ya está registrado");

    const hashedPassword = bcrypt.hashSync("password123", 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: "CLIENTE",
        phone: data.phone || null,
        client: {
          create: {
            company: data.company || null,
            phone: data.phone || null,
            address: data.address || null,
            notes: data.notes || null,
          },
        },
      },
      include: { client: true },
    });
    dbLogger.info({ userId: user.id }, "Cliente creado");
    return user;
  },

  async softDelete(id: string) {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client || client.deletedAt) throw new NotFoundError("Cliente no encontrado");

    await prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    dbLogger.info({ clientId: id }, "Cliente eliminado (soft delete)");
  },
};
