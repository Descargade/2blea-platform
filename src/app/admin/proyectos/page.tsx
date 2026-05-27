"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProjects, useCreateProject } from "@/hooks/queries/use-projects";
import { useClients } from "@/hooks/queries/use-clients";
import { useServices } from "@/hooks/queries/use-services";
import { PageHeader } from "@/components/shared/page-header";
import { TableSkeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Modal } from "@/components/shared/modal";
import { projectCreateSchema, type ProjectCreateInput } from "@/lib/validations";
import type { ProjectItem, ExtraItem, ServiceItem } from "@/types";
import { FolderKanban, Plus } from "lucide-react";

const statusStyles: Record<string, string> = {
  CONSULTA: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  DISENO: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DESARROLLO: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  REVISION: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  OPTIMIZACION: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ENTREGADO: "bg-green-500/10 text-green-400 border-green-500/20",
};

const statusLabels: Record<string, string> = {
  CONSULTA: "Consulta",
  DISENO: "Diseño",
  DESARROLLO: "Desarrollo",
  REVISION: "Revisión",
  OPTIMIZACION: "Optimización",
  ENTREGADO: "Entregado",
};

export default function AdminProyectos() {
  const [showModal, setShowModal] = useState(false);
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const { data: clients } = useClients();
  const { data: services } = useServices();
  const createMutation = useCreateProject();

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<ExtraItem[]>([]);
  const [cost, setCost] = useState(0);

  const form = useForm<ProjectCreateInput>({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: { name: "", description: "", clientId: "", startDate: "", endDate: "" },
  });

  const serviceList = (Array.isArray(services) ? services : []) as ServiceItem[];
  const currentService = serviceList.find((s) => s.id === selectedServiceId);

  function handleServiceChange(id: string) {
    setSelectedServiceId(id);
    setSelectedExtras([]);
    const svc = serviceList.find((s) => s.id === id);
    if (svc) setCost(svc.basePrice);
  }

  function toggleExtra(extra: ExtraItem) {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) return prev.filter((e) => e.id !== extra.id);
      return [...prev, extra];
    });
  }

  function resetForm() {
    form.reset();
    setSelectedServiceId("");
    setSelectedExtras([]);
    setCost(0);
  }

  async function onSubmit(data: ProjectCreateInput) {
    const extraCost = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    await createMutation.mutateAsync({
      ...data,
      serviceId: selectedServiceId || undefined,
      cost: cost + extraCost || undefined,
      extras: selectedExtras.length > 0 ? selectedExtras : undefined,
    });
    resetForm();
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

      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm(); }} title="Nuevo proyecto">
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
          <div>
            <label className="block text-sm text-gray-400 mb-1">Servicio</label>
            <select value={selectedServiceId} onChange={(e) => handleServiceChange(e.target.value)} className="premium-input w-full">
              <option value="">Sin servicio</option>
              {serviceList.map((s) => (
                <option key={s.id} value={s.id}>{s.name} (${s.basePrice.toLocaleString("es-AR")})</option>
              ))}
            </select>
          </div>
          {currentService && currentService.extras && currentService.extras.length > 0 && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Extras</label>
              <div className="space-y-2">
                {currentService.extras.map((extra) => (
                  <label key={extra.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedExtras.some((e) => e.id === extra.id)}
                      onChange={() => toggleExtra(extra)}
                      className="accent-premium-violet"
                    />
                    <span>{extra.name}</span>
                    <span className="text-gray-500 ml-auto">${extra.price.toLocaleString("es-AR")}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Costo total ($)</label>
            <input type="number" min={0} value={cost + selectedExtras.reduce((s, e) => s + e.price, 0)} onChange={(e) => setCost(Number(e.target.value))} className="premium-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha inicio</label>
              <input type="date" {...form.register("startDate")} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha fin</label>
              <input type="date" {...form.register("endDate")} className="premium-input w-full" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="premium-button-outline text-sm">Cancelar</button>
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
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto" role="table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                    <th className="p-4 font-medium" scope="col">Proyecto</th>
                    <th className="p-4 font-medium" scope="col">Cliente</th>
                    <th className="p-4 font-medium" scope="col">Servicio</th>
                    <th className="p-4 font-medium" scope="col">Estado</th>
                    <th className="p-4 font-medium" scope="col">Progreso</th>
                    <th className="p-4 font-medium" scope="col">Costo</th>
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
                      <td className="p-4 text-gray-400">{p.service?.name || "---"}</td>
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
                      <td className="p-4 text-gray-400">
                        {p.cost ? `$${p.cost.toLocaleString("es-AR")}` : "---"}
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-AR") : "---"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-white/5">
              {list.map((p) => (
                <Link key={p.id} href={`/admin/proyectos/${p.id}`} className="block p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">{p.client?.user?.name || "Sin cliente"}{p.service ? ` · ${p.service.name}` : ""}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ml-2 ${statusStyles[p.status] || ""}`}>
                      {statusLabels[p.status] || p.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-premium-violet rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{p.progress}%</span>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{p.cost ? `$${p.cost.toLocaleString("es-AR")}` : "---"}</span>
                    <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-AR") : "---"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
