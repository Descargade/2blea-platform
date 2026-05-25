import { requireAdmin } from "@/lib/guards";
import { projectService } from "@/server/services/project.service";
import { projectUpdateSchema } from "@/lib/validations";
import { success, error } from "@/lib/api-response";
import { pusherServer, CHANNELS, EVENTS } from "@/server/pusher";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data = projectUpdateSchema.parse(body);
    const project = await projectService.update(id, data, user.id);

    // Realtime
    try {
      await pusherServer.trigger(CHANNELS.project(id), EVENTS.PROJECT_UPDATED, {
        project: { id: project.id, name: project.name, status: project.status, progress: project.progress },
        userId: user.id,
      });
    } catch { /* silent */ }

    return success(project, "Proyecto actualizado correctamente");
  } catch (e) {
    return error(e, "Error al actualizar proyecto");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await projectService.softDelete(id);
    return success({ deleted: true }, "Proyecto eliminado correctamente");
  } catch (e) {
    return error(e, "Error al eliminar proyecto");
  }
}
