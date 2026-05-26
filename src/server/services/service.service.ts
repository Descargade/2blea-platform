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
        order: data.order ?? (maxOrder._max.order ?? 0) + 1,
      },
    });
    dbLogger.info({ serviceId: created.id }, "Servicio creado");
    return created;
  },

  async update(data: z.infer<typeof serviceUpdateSchema>) {
    const updated = await prisma.service.update({
      where: { id: data.id },
      data: { basePrice: data.basePrice, active: data.active },
    });
    dbLogger.info({ serviceId: data.id }, "Servicio actualizado");
    return updated;
  },
};
