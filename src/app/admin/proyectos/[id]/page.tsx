"use client";
import { useParams } from "next/navigation";
import { useProject, useUpdateProject } from "@/hooks/queries/use-projects";
import { Skeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { FileUpload } from "@/components/shared/file-upload";
import { FileGallery } from "@/components/shared/file-gallery";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { Modal } from "@/components/shared/modal";
import { useState } from "react";
import { ArrowLeft, Save, Upload, Activity, FolderOpen, DollarSign, Link2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { ProjectItem, ProjectLink } from "@/types";

const statusOptions = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROGRESO", label: "En progreso" },
  { value: "ESPERANDO_FEEDBACK", label: "Esperando feedback" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "ENTREGADO", label: "Entregado" },
];

type Tab = "info" | "files" | "activity" | "payments" | "links";

function ProjectInfoForm({ project, onSave, isPending }: { project: ProjectItem; onSave: (data: Record<string, unknown>) => void; isPending: boolean }) {
  const [status, setStatus] = useState<string>(project.status);
  const [progress, setProgress] = useState(project.progress);
  const [startDate, setStartDate] = useState(project.startDate ?? "");
  const [endDate, setEndDate] = useState(project.endDate ?? "");
  const [description, setDescription] = useState(project.description ?? "");

  function handleSave() {
    onSave({ status, progress, description: description || undefined, startDate: startDate || undefined, endDate: endDate || undefined });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Cliente: {project.client?.user?.name || "Sin cliente"}
            {project.service ? ` · Servicio: ${project.service.name}` : ""}
          </p>
        </div>
        <button onClick={handleSave} disabled={isPending} className="premium-button flex items-center gap-2">
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card space-y-6">
          <h2 className="text-lg font-semibold">Información del proyecto</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="premium-input w-full h-24 resize-none" placeholder="Descripción del proyecto..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha de inicio</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha de fin</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="premium-input w-full" />
            </div>
          </div>
        </div>

        <div className="premium-card space-y-6">
          <h2 className="text-lg font-semibold">Estado y progreso</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Estado</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="premium-input w-full">
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Progreso: {progress}%</label>
            <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full accent-premium-violet" />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-premium-violet rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsTab({ project, onRefresh }: { project: ProjectItem; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");

  async function handleAddPayment() {
    await api.post(`/projects/${project.id}/payments`, { amount, note: note || undefined });
    setShowAdd(false);
    setAmount(0);
    setNote("");
    onRefresh();
  }

  const totalPaid = project.payments?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const balance = (project.cost ?? 0) - totalPaid;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Costo total</p>
          <p className="text-2xl font-bold">${(project.cost ?? 0).toLocaleString("es-AR")}</p>
        </div>
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Pagado</p>
          <p className="text-2xl font-bold text-green-400">${totalPaid.toLocaleString("es-AR")}</p>
        </div>
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Saldo pendiente</p>
          <p className={`text-2xl font-bold ${balance > 0 ? "text-yellow-400" : "text-green-400"}`}>
            ${balance.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      <div className="premium-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Pagos registrados</h2>
          <button onClick={() => setShowAdd(true)} className="premium-button text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Registrar pago
          </button>
        </div>

        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Registrar pago">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monto ($)</label>
              <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nota (opcional)</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="premium-input w-full" placeholder="Ej: Primer pago" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="premium-button-outline text-sm">Cancelar</button>
              <button onClick={handleAddPayment} disabled={amount <= 0} className="premium-button text-sm">Registrar</button>
            </div>
          </div>
        </Modal>

        {(!project.payments || project.payments.length === 0) ? (
          <p className="text-gray-500 text-sm">No hay pagos registrados.</p>
        ) : (
          <div className="space-y-2">
            {project.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="font-medium text-green-400">+${p.amount.toLocaleString("es-AR")}</p>
                  {p.note && <p className="text-xs text-gray-500">{p.note}</p>}
                </div>
                <span className="text-xs text-gray-600">{new Date(p.date).toLocaleDateString("es-AR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LinksTab({ project, onRefresh }: { project: ProjectItem; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  async function handleAdd() {
    await api.post(`/projects/${project.id}/links`, { url, title: title || url });
    setShowAdd(false);
    setUrl("");
    setTitle("");
    onRefresh();
  }

  async function handleDelete(id: string) {
    await api.delete(`/projects/${project.id}/links/${id}`);
    onRefresh();
  }

  return (
    <div className="premium-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Links / Avances</h2>
        <button onClick={() => setShowAdd(true)} className="premium-button text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar link
        </button>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Agregar link de avance">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="premium-input w-full" placeholder="Ej: Diseño v1" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">URL</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="premium-input w-full" placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="premium-button-outline text-sm">Cancelar</button>
            <button onClick={handleAdd} disabled={!url.trim()} className="premium-button text-sm">Agregar</button>
          </div>
        </div>
      </Modal>

      {(!project.links || project.links.length === 0) ? (
        <p className="text-gray-500 text-sm">No hay links de avance.</p>
      ) : (
        <div className="space-y-2">
          {project.links.map((link) => (
            <div key={link.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <Link2 className="w-4 h-4 text-gray-500" />
                <div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-premium-accent hover:underline text-sm font-medium">{link.title}</a>
                  <p className="text-xs text-gray-600">{new Date(link.createdAt).toLocaleDateString("es-AR")}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(link.id)} className="p-1 rounded hover:bg-white/10 transition-colors" aria-label="Eliminar link">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminProjectDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: project, isLoading, isError, refetch } = useProject(id);
  const updateMutation = useUpdateProject();
  const [tab, setTab] = useState<Tab>("info");

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /><Skeleton className="h-64 w-full" /></div>;
  if (isError) return <ErrorState message="Error al cargar proyecto" onRetry={refetch} />;
  if (!project) return <ErrorState message="Proyecto no encontrado" />;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "info", label: "Información", icon: <FolderOpen className="w-4 h-4" /> },
    { key: "files", label: "Archivos", icon: <Upload className="w-4 h-4" /> },
    { key: "payments", label: "Pagos", icon: <DollarSign className="w-4 h-4" /> },
    { key: "links", label: "Links / Avances", icon: <Link2 className="w-4 h-4" /> },
    { key: "activity", label: "Actividad", icon: <Activity className="w-4 h-4" /> },
  ];

  function handleSave(data: Record<string, unknown>) {
    updateMutation.mutate({ id, ...data }, { onSuccess: () => refetch() });
  }

  return (
    <div>
      <Link href="/admin/proyectos" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a proyectos
      </Link>

      <div className="flex gap-1 mb-8 p-1 bg-premium-darker rounded-xl border border-white/5 w-fit overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              tab === t.key ? "bg-premium-violet/20 text-white border border-premium-violet/30" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && <ProjectInfoForm key={project.id} project={project} onSave={handleSave} isPending={updateMutation.isPending} />}

      {tab === "files" && (
        <div className="space-y-8">
          <div className="premium-card">
            <h2 className="text-lg font-semibold mb-1">Subir archivos</h2>
            <p className="text-sm text-gray-500 mb-4">JPG, PNG, WEBP, PDF, MP4, ZIP — hasta 100MB</p>
            <FileUpload projectId={id} onSuccess={refetch} />
          </div>
          <div className="premium-card">
            <h2 className="text-lg font-semibold mb-4">Archivos del proyecto ({project.files?.length || 0})</h2>
            <FileGallery projectId={id} />
          </div>
        </div>
      )}

      {tab === "payments" && <PaymentsTab project={project} onRefresh={refetch} />}

      {tab === "links" && <LinksTab project={project} onRefresh={refetch} />}

      {tab === "activity" && (
        <div className="premium-card">
          <ActivityTimeline projectId={id} limit={50} />
        </div>
      )}
    </div>
  );
}
