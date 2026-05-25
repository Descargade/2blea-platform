import { requireAuth } from "@/lib/guards";
import { storage } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { error } from "@/lib/api-response";
import { pusherServer, CHANNELS, EVENTS } from "@/server/pusher";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await requireAuth();
    const { key } = await params;

    const projectFile = await prisma.projectFile.findFirst({
      where: { key, deletedAt: null },
    });
    if (!projectFile) {
      return NextResponse.json({ success: false, error: "Archivo no encontrado" }, { status: 404 });
    }

    const { buffer } = await storage.read(key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": projectFile.mimeType,
        "Content-Disposition": `inline; filename="${projectFile.originalName}"`,
        "Content-Length": String(projectFile.size),
      },
    });
  } catch (e) {
    return error(e, "Error al descargar archivo");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await requireAuth();
    const { key } = await params;

    const projectFile = await prisma.projectFile.findFirst({
      where: { key, deletedAt: null },
    });
    if (!projectFile) {
      return NextResponse.json({ success: false, error: "Archivo no encontrado" }, { status: 404 });
    }

    await storage.delete(key);
    await prisma.projectFile.update({
      where: { id: projectFile.id },
      data: { deletedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId: projectFile.projectId,
        action: "FILE_DELETED",
        details: `Archivo "${projectFile.originalName}" eliminado`,
      },
    });

    // Realtime
    try {
      await pusherServer.trigger(CHANNELS.project(projectFile.projectId), EVENTS.FILE_DELETED, {
        fileId: projectFile.id,
        key: projectFile.key,
        userId: user.id,
      });
    } catch { /* silent */ }

    return NextResponse.json({ success: true, message: "Archivo eliminado correctamente" });
  } catch (e) {
    return error(e, "Error al eliminar archivo");
  }
}
