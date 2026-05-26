import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { ClientCreateInput, ClientUpdateInput } from "@/lib/validations";
import { NotFoundError, ConflictError } from "@/lib/app-error";
import { dbLogger } from "@/lib/logger";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "";
  for (let i = 0; i < 10; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
  return pw;
}

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

  async findById(id: string) {
    const client = await prisma.client.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        projects: {
          where: { deletedAt: null },
          include: { service: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!client) throw new NotFoundError("Cliente no encontrado");
    return client;
  },

  async create(data: ClientCreateInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError("El email ya está registrado");

    const rawPassword = generatePassword();
    const hashedPassword = bcrypt.hashSync(rawPassword, 10);
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
    dbLogger.info({ userId: user.id }, "Cliente creado con contraseña autogenerada");
    return { user, rawPassword };
  },

  async update(id: string, data: ClientUpdateInput) {
    const client = await prisma.client.findFirst({ where: { id, deletedAt: null } });
    if (!client) throw new NotFoundError("Cliente no encontrado");

    if (data.email || data.name || data.phone) {
      const updateData: Record<string, unknown> = {};
      if (data.name) updateData.name = data.name;
      if (data.email) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      await prisma.user.update({ where: { id: client.userId }, data: updateData });
    }

    const clientData: Record<string, unknown> = {};
    if (data.company !== undefined) clientData.company = data.company;
    if (data.phone !== undefined) clientData.phone = data.phone;
    if (data.address !== undefined) clientData.address = data.address;
    if (data.notes !== undefined) clientData.notes = data.notes;

    if (Object.keys(clientData).length > 0) {
      await prisma.client.update({ where: { id }, data: clientData });
    }

    const updated = await prisma.client.findFirst({
      where: { id },
      include: { user: { select: { id: true, email: true, name: true, phone: true } } },
    });
    dbLogger.info({ clientId: id }, "Cliente actualizado");
    return updated;
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
