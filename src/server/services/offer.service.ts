import { prisma } from "@/lib/prisma";
import type { OfferCreateInput } from "@/lib/validations";
import { NotFoundError } from "@/lib/app-error";
import { dbLogger } from "@/lib/logger";

export const offerService = {
  async findAll() {
    return prisma.offer.findMany({
      where: { deletedAt: null },
      include: { service: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(data: OfferCreateInput) {
    const offer = await prisma.offer.create({
      data: {
        title: data.title,
        description: data.description || null,
        discount: data.discount,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        active: data.active ?? true,
        featured: data.featured ?? false,
        serviceId: data.serviceId || null,
      },
    });
    dbLogger.info({ offerId: offer.id }, "Oferta creada");
    return offer;
  },

  async softDelete(id: string) {
    const offer = await prisma.offer.findFirst({ where: { id, deletedAt: null } });
    if (!offer) throw new NotFoundError("Oferta no encontrada");
    await prisma.offer.update({ where: { id }, data: { deletedAt: new Date() } });
    dbLogger.info({ offerId: id }, "Oferta eliminada (soft delete)");
  },
};
