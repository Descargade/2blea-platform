import { createActivity, createNotification, notifyProjectUsers } from "@/server/notifications";
import { prisma } from "@/lib/prisma";

export const activity = {
  async projectCreated(projectId: string, name: string, userId: string) {
    await Promise.all([
      createActivity({ userId, projectId, action: "PROJECT_CREATED", details: `Proyecto "${name}" creado` }),
      notifyProjectUsers(projectId, {
        type: "PROJECT_UPDATED",
        title: "Nuevo proyecto",
        message: `El proyecto "${name}" ha sido creado`,
        link: `/admin/proyectos/${projectId}`,
        excludeUserId: userId,
      }),
    ]);
  },

  async statusChanged(projectId: string, from: string, to: string, userId: string) {
    await Promise.all([
      createActivity({ userId, projectId, action: "STATUS_CHANGED", details: `Estado: ${from} → ${to}` }),
      notifyProjectUsers(projectId, {
        type: "PROJECT_UPDATED",
        title: "Estado actualizado",
        message: `Proyecto: ${from} → ${to}`,
        link: `/admin/proyectos/${projectId}`,
        excludeUserId: userId,
      }),
    ]);
  },

  async progressUpdated(projectId: string, progress: number, userId: string) {
    await Promise.all([
      createActivity({ userId, projectId, action: "PROGRESS_UPDATED", details: `Progreso: ${progress}%` }),
      notifyProjectUsers(projectId, {
        type: "PROGRESS_UPDATED",
        title: "Progreso actualizado",
        message: `El proyecto está al ${progress}%`,
        link: `/admin/proyectos/${projectId}`,
        excludeUserId: userId,
      }),
    ]);
  },

  async fileUploaded(projectId: string, fileName: string, userId: string) {
    await Promise.all([
      createActivity({ userId, projectId, action: "FILE_UPLOADED", details: `Archivo "${fileName}" subido` }),
      notifyProjectUsers(projectId, {
        type: "FILE_UPLOADED",
        title: "Archivo subido",
        message: `"${fileName}" fue subido al proyecto`,
        link: `/admin/proyectos/${projectId}`,
        excludeUserId: userId,
      }),
    ]);
  },

  async fileDeleted(projectId: string, fileName: string, userId: string) {
    await createActivity({ userId, projectId, action: "FILE_DELETED", details: `Archivo "${fileName}" eliminado` });
  },

  async messageSent(conversationId: string, projectId: string | null, senderId: string, content: string) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        client: { include: { user: { select: { id: true, name: true } } } },
        admin: { select: { id: true, name: true } },
      },
    });
    if (!conv) return;

    const senderName = conv.admin?.id === senderId ? conv.admin.name : conv.client?.user?.name || "Usuario";

    const logs: Promise<unknown>[] = [
      createActivity({ userId: senderId, projectId: projectId ?? undefined, action: "MESSAGE_SENT", details: `${senderName}: ${content.slice(0, 100)}` }),
    ];

    const adminUsers = await prisma.user.findMany({ where: { role: "ADMIN", deletedAt: null } });
    const recipientIds = adminUsers
      .map((u) => u.id)
      .filter((id) => id !== senderId);

    if (conv.client?.user?.id && conv.client.user.id !== senderId) {
      recipientIds.push(conv.client.user.id);
    }

    for (const recipientId of recipientIds) {
      logs.push(
        createNotification({
          userId: recipientId,
          type: "NEW_MESSAGE",
          title: `Nuevo mensaje de ${senderName}`,
          message: content.slice(0, 150),
          link: projectId ? `/admin/proyectos/${projectId}` : "/admin/mensajes",
        })
      );
    }

    await Promise.all(logs);
  },

  async offerCreated(offerId: string, title: string, discount: number, userId: string) {
    await createActivity({ userId, action: "OFFER_CREATED", details: `Oferta "${title}" creada` });
    const adminUsers = await prisma.user.findMany({ where: { role: "ADMIN", deletedAt: null } });
    await Promise.all(
      adminUsers
        .filter((u) => u.id !== userId)
        .map((u) =>
          createNotification({
            userId: u.id,
            type: "OFFER_CREATED",
            title: "Nueva oferta",
            message: `Oferta "${title}" creada con ${discount}% de descuento`,
            link: "/admin/ofertas",
          })
        )
    );
  },

  async clientCreated(clientName: string, userId: string) {
    await createActivity({ userId, action: "CLIENT_CREATED", details: `Cliente "${clientName}" registrado` });
  },
};
