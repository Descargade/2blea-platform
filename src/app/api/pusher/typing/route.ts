import { auth } from "@/lib/auth";
import { pusherServer, CHANNELS } from "@/server/pusher";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { conversationId, event } = await req.json();

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        client: { include: { user: { select: { id: true, name: true } } } },
        project: { select: { id: true } },
      },
    });

    if (!conversation) return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });

    const data = {
      userId: session.user.id,
      name: session.user.name,
      conversationId,
    };

    const channels: string[] = [];

    if (session.user.role === "ADMIN") {
      if (conversation.client?.user?.id) {
        channels.push(CHANNELS.user(conversation.client.user.id));
      }
    } else {
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN", deletedAt: null },
        select: { id: true },
      });
      adminUsers.forEach((u) => channels.push(CHANNELS.user(u.id)));
    }

    if (conversation.project?.id) {
      channels.push(CHANNELS.project(conversation.project.id));
    }

    if (channels.length > 0) {
      await pusherServer.trigger(channels, event, data);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al enviar evento" }, { status: 500 });
  }
}
