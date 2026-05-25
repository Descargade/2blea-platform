"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProjects, useCreateProject } from "@/hooks/queries/use-projects";
import { useClients } from "@/hooks/queries/use-clients";
import { PageHeader } from "@/components/shared/page-header";
import { TableSkeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Modal } from "@/components/shared/modal";
import { projectCreateSchema, type ProjectCreateInput } from "@/lib/validations";
import type { ProjectItem } from "@/types";
import { FolderKanban, Plus } from "lucide-react";

const statusStyles: Record<string, string> = {
  PENDIENTE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  EN_PROGRESO: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ESPERANDO_FEEDBACK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  FINALIZADO: "bg-green-500/10 text-green-500 border-green-500/20",
  ENTREGADO: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En progreso",
  ESPERANDO_FEEDBACK: "Esperando feedback",
  FINALIZADO: "Finalizado",
  ENTREGADO: "Entregado",
};

export default function AdminProyectos() {
  const [showModal, setShowModal] = useState(false);
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const { data: clients } = useClients();
  const createMutation = useCreateProject();

  const form = useForm<ProjectCreateInput>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: { name: "", description: "", clientId: "" },
  });

  async function onSubmit(data: ProjectCreateInput) {
    await createMutation.mutateAsync(data);
    form.reset();
    setShowModal(false);
  }

  const list: ProjectItem[] = Array.isArray(projects) ? projects : [];
  const clientList = Array.isArray(clients) ? clients : [];

  if (isError) return <ErrorState message="Error al cargar proyectos" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Proyectos"
        description={`${list.length} proyectos registrados`}
        action={
          <button onClick={() => setShowModal(true)} className="premium-button text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo proyecto
          </button>
        }
      />

      <Modal open={showModal} onClose={() => { setShowModal(false); form.reset(); }} title="Nuevo proyecto">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input {...form.register("name")} className="premium-input w-full" placeholder="Nombre del proyecto" />
            {form.formState.errors.name && <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea {...form.register("description")} className="premium-input w-full h-24 resize-none" placeholder="Descripción del proyecto" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cliente</label>
            <select {...form.register("clientId")} className="premium-input w-full">
              <option value="">Seleccionar cliente</option>
              {clientList.map((c) => (
                <option key={c.id} value={c.id}>{c.user?.name || "---"}</option>
              ))}
            </select>
            {form.formState.errors.clientId && <p className="text-red-400 text-xs mt-1">{form.formState.errors.clientId.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); form.reset(); }} className="premium-button-outline text-sm">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="premium-button text-sm">
              {createMutation.isPending ? "Guardando..." : "Crear proyecto"}
            </button>
          </div>
        </form>
      </Modal>

      <div className="premium-card p-0 overflow-hidden">
        {isLoading ? <TableSkeleton rows={5} /> : list.length === 0 ? (
          <EmptyState icon={<FolderKanban className="w-12 h-12" />} title="No hay proyectos" description="Los proyectos creados aparecerán aquí" />
        ) : (
          <div className="overflow-x-auto" role="table">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                  <th className="p-4 font-medium" scope="col">Proyecto</th>
                  <th className="p-4 font-medium" scope="col">Cliente</th>
                  <th className="p-4 font-medium" scope="col">Estado</th>
                  <th className="p-4 font-medium" scope="col">Progreso</th>
                  <th className="p-4 font-medium" scope="col">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">
                      <Link href={`/admin/proyectos/${p.id}`} className="hover:text-premium-accent transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-400">{p.client?.user?.name || "---"}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusStyles[p.status] || ""}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100}>
                          <div className="h-full bg-premium-violet rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-sm text-gray-400 w-8 text-right">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-AR") : "---"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
