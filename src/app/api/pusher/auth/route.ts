import { auth } from "@/lib/auth";
import { pusherServer } from "@/server/pusher";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed, remaining } = checkRateLimit(rateLimitKey(ip, "pusher-auth"));

    if (!allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intente de nuevo en 1 minuto." },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const socketId = formData.get("socket_id") as string;
    const channelName = formData.get("channel_name") as string;

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
    }

    // Private channel auth with role-based access
    if (channelName.startsWith("private-user-")) {
      const userId = channelName.replace("private-user-", "");
      if (session.user.id !== userId) {
        return NextResponse.json({ error: "Acceso denegado al canal" }, { status: 403 });
      }
    }

    if (channelName.startsWith("private-project-")) {
      const projectId = channelName.replace("private-project-", "");
      const project = await prisma.project.findFirst({ where: { id: projectId, deletedAt: null } });
      if (!project) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      }

      const client = await prisma.client.findUnique({ where: { userId: session.user.id } });
      const isAdmin = session.user.role === "ADMIN";
      const isProjectClient = client?.id === project.clientId;

      if (!isAdmin && !isProjectClient) {
        return NextResponse.json({ error: "Acceso denegado al proyecto" }, { status: 403 });
      }
    }

    if (channelName === "private-admin" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch {
    return NextResponse.json({ error: "Error de autenticación" }, { status: 500 });
  }
}
