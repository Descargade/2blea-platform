import { prisma } from "@/lib/prisma";
import type { z } from "zod";
import type { serviceUpdateSchema } from "@/lib/validations";
import { dbLogger } from "@/lib/logger";

export const serviceService = {
  async findAll() {
    return prisma.service.findMany({
      where: { deletedAt: null },
      include: { extras: { where: { deletedAt: null } } },
      orderBy: { order: "asc" },
    });
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
