import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { serviceUpdateSchema, serviceCreateSchema } from "@/lib/validations";
import { dbLogger } from "@/lib/logger";

export const serviceService = {
  async findAll() {
    return prisma.service.findMany({
      where: { deletedAt: null },
      include: { extras: { where: { deletedAt: null } } },
      orderBy: { order: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.service.findFirst({
      where: { id, deletedAt: null },
      include: { extras: { where: { deletedAt: null } } },
    });
  },

  async create(data: z.infer<typeof serviceCreateSchema>) {
    const maxOrder = await prisma.service.aggregate({ _max: { order: true } });
    const created = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description || "",
        basePrice: data.basePrice,
        active: data.active ?? true,
        order: data.order ?? (maxOrder._max.order ?? 0) + 1,
        extras: data.extras?.length
          ? { create: data.extras.map((e) => ({ name: e.name, price: e.price })) }
          : undefined,
      },
      include: { extras: { where: { deletedAt: null } } },
    });
    dbLogger.info({ serviceId: created.id }, "Servicio creado");
    return created;
  },

  async update(data: z.infer<typeof serviceUpdateSchema>) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.order !== undefined) updateData.order = data.order;

    const updated = await prisma.service.update({
      where: { id: data.id },
      data: updateData,
      include: { extras: { where: { deletedAt: null } } },
    });

    if (data.extras !== undefined) {
      const existing = await prisma.extra.findMany({
        where: { serviceId: data.id, deletedAt: null },
      });
      const existingIds = existing.map((e) => e.id);
      const incomingIds = data.extras.filter((e) => e.id).map((e) => e.id!);
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        await prisma.extra.updateMany({
          where: { id: { in: toDelete } },
          data: { deletedAt: new Date() },
        });
      }
      for (const ext of data.extras) {
        if (ext.id) {
          await prisma.extra.update({
            where: { id: ext.id },
            data: { name: ext.name, price: ext.price },
          });
        } else {
          await prisma.extra.create({
            data: { name: ext.name, price: ext.price, serviceId: data.id },
          });
        }
      }
    }

    dbLogger.info({ serviceId: data.id }, "Servicio actualizado");
    const result = await prisma.service.findFirst({
      where: { id: data.id },
      include: { extras: { where: { deletedAt: null } } },
    });
    return result;
  },

  async softDelete(id: string) {
    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    dbLogger.info({ serviceId: id }, "Servicio eliminado (soft delete)");
  },
};
