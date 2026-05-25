import { requireAdmin } from "@/lib/guards";
import { storage } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { success, error } from "@/lib/api-response";
import { pusherServer, CHANNELS, EVENTS } from "@/server/pusher";

const MAX_FILES_PER_PROJECT = 200;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = checkRateLimit(rateLimitKey(ip, "upload"), 50);
    if (!allowed) {
      return error(new Error("RateLimit"), "Demasiadas solicitudes. Intente de nuevo en 1 minuto.");
    }

    const user = await requireAdmin();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file) return error(new Error("Archivo requerido"), "No se recibió ningún archivo");
    if (!projectId) return error(new Error("ProjectId requerido"), "Falta el ID del proyecto");

    console.log(`[Upload] User ${user.id} uploading "${file.name}" (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB) to project ${projectId}`);

    const project = await prisma.project.findFirst({ where: { id: projectId, deletedAt: null } });
    if (!project) return error(new Error("NotFound"), "Proyecto no encontrado");

    const fileCount = await prisma.projectFile.count({
      where: { projectId, deletedAt: null },
    });
    if (fileCount >= MAX_FILES_PER_PROJECT) {
      return error(new Error("LimitExceeded"), `Límite de ${MAX_FILES_PER_PROJECT} archivos por proyecto alcanzado`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // File size validation (redundant with storage.validate but adds early rejection)
    if (buffer.length > 100 * 1024 * 1024) {
      return error(new Error("TooLarge"), "El archivo excede el límite de 100MB");
    }

    const validation = storage.validate(file.type, buffer.length);
    if (!validation.valid) return error(new Error(validation.error!), validation.error!);

    const { key, url } = await storage.save(buffer, file.name, file.type);

    const projectFile = await prisma.projectFile.create({
      data: {
        projectId,
        originalName: file.name,
        key,
        mimeType: file.type,
        size: buffer.length,
        category: storage.getCategory(file.type),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId,
        action: "FILE_UPLOADED",
        details: `Archivo "${file.name}" subido`,
      },
    });

    // Realtime
    try {
      await pusherServer.trigger(CHANNELS.project(projectId), EVENTS.FILE_UPLOADED, {
        file: { ...projectFile, url },
        userId: user.id,
        userName: user.name,
      });
    } catch { /* silent */ }

    return success({ ...projectFile, url }, "Archivo subido correctamente", 201);
  } catch (e) {
    return error(e, "Error al subir archivo");
  }
}
