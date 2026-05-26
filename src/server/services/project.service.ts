import { prisma } from "@/lib/prisma";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/lib/validations";
import { NotFoundError } from "@/lib/app-error";
import { dbLogger } from "@/lib/logger";

export const projectService = {
  async findAllForUser(userId: string, role: string) {
    dbLogger.debug({ userId, role }, "Buscando proyectos para usuario");
    if (role === "ADMIN") {
      return prisma.project.findMany({
        where: { deletedAt: null },
        include: {
          client: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          service: { select: { id: true, name: true } },
          files: true,
          links: { orderBy: { createdAt: "desc" } },
          payments: { orderBy: { date: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      });
    }
    const client = await prisma.client.findUnique({ where: { userId } });
    if (!client) return [];
    return prisma.project.findMany({
      where: { clientId: client.id, deletedAt: null },
      include: {
        service: { select: { id: true, name: true } },
        files: true,
        links: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { date: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        client: { include: { user: { select: { id: true, name: true, email: true } } } },
        service: { select: { id: true, name: true } },
        files: true,
        links: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { date: "desc" } },
        activityLogs: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!project) throw new NotFoundError("Proyecto no encontrado");
    return project;
  },

  async create(data: ProjectCreateInput, userId: string) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        clientId: data.clientId,
        serviceId: data.serviceId || null,
        cost: data.cost || null,
        extras: data.extras || undefined,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    await prisma.activityLog.create({
      data: {
        userId,
        projectId: project.id,
        action: "PROJECT_CREATED",
        details: `Proyecto "${data.name}" creado`,
      },
    });
    dbLogger.info({ projectId: project.id }, "Proyecto creado");
    return project;
  },

  async update(id: string, data: ProjectUpdateInput, userId: string) {
    const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
    if (!project) throw new NotFoundError("Proyecto no encontrado");

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status) updateData.status = data.status;
    if (data.progress !== undefined) updateData.progress = data.progress;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.totalPaid !== undefined) updateData.totalPaid = data.totalPaid;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    if (data.status && data.status !== project.status) {
      await prisma.activityLog.create({
        data: {
          userId,
          projectId: id,
          action: "STATUS_CHANGED",
          details: `Estado cambiado: ${project.status} → ${data.status}`,
        },
      });
    }
    dbLogger.info({ projectId: id }, "Proyecto actualizado");
    return updated;
  },

  async softDelete(id: string) {
    const project = await prisma.project.findFirst({ where: { id, deletedAt: null } });
    if (!project) throw new NotFoundError("Proyecto no encontrado");
    await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
    dbLogger.info({ projectId: id }, "Proyecto eliminado (soft delete)");
  },
};
