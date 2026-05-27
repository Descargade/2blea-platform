import { requireAuth } from "@/lib/guards";
import { storage } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { error } from "@/lib/api-response";
import { pusherServer, CHANNELS, EVENTS } from "@/server/pusher";
import { MIME_EXTENSIONS } from "@/lib/storage/types";
import { v2 as cloudinary } from "cloudinary";

function getCloudinaryUrl(key: string, mimeType: string): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return "";
  let resourceType = "raw";
  if (mimeType.startsWith("image/")) resourceType = "image";
  else if (mimeType.startsWith("video/")) resourceType = "video";
  const ext = MIME_EXTENSIONS[mimeType] || "";
  const urlKey = resourceType === "raw" ? `${key}${ext}` : key;
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${urlKey}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    await requireAuth();
    const { key } = await params;
    const keyStr = Array.isArray(key) ? key.join("/") : key;

    const projectFile = await prisma.projectFile.findFirst({
      where: { key: keyStr, deletedAt: null },
    });
    if (!projectFile) {
      return NextResponse.json({ success: false, error: "Archivo no encontrado" }, { status: 404 });
    }

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const url = getCloudinaryUrl(keyStr, projectFile.mimeType);
      return NextResponse.redirect(url, 302);
    }

    const { buffer } = await storage.read(keyStr);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": projectFile.mimeType,
        "Content-Disposition": `inline; filename="${projectFile.originalName}"`,
      },
    });
  } catch (e) {
    return error(e, "Error al descargar archivo");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const user = await requireAuth();
    const { key } = await params;
    const keyStr = Array.isArray(key) ? key.join("/") : key;

    const projectFile = await prisma.projectFile.findFirst({
      where: { key: keyStr, deletedAt: null },
    });
    if (!projectFile) {
      return NextResponse.json({ success: false, error: "Archivo no encontrado" }, { status: 404 });
    }

    await storage.delete(keyStr);
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
