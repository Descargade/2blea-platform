import { requireAuth, requireAdmin } from "@/lib/guards";
import { projectService } from "@/server/services/project.service";
import { projectCreateSchema } from "@/lib/validations";
import { success, created, error } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await requireAuth();
    const projects = await projectService.findAllForUser(user.id, user.role);
    return success(projects);
  } catch (e) {
    return error(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    const body = await req.json();
    const data = projectCreateSchema.parse(body);
    const project = await projectService.create(data, user.id);
    return created(project, "Proyecto creado correctamente");
  } catch (e) {
    return error(e, "Error al crear proyecto");
  }
}
