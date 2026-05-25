"use client";
import { useParams } from "next/navigation";
import { useProject, useUpdateProject } from "@/hooks/queries/use-projects";
import { Skeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { FileUpload } from "@/components/shared/file-upload";
import { FileGallery } from "@/components/shared/file-gallery";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { useState } from "react";
import { ArrowLeft, Save, Upload, Activity, FolderOpen } from "lucide-react";
import Link from "next/link";
import type { ProjectItem, ProjectStatus } from "@/types";

const statusOptions = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROGRESO", label: "En progreso" },
  { value: "ESPERANDO_FEEDBACK", label: "Esperando feedback" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "ENTREGADO", label: "Entregado" },
];

type Tab = "info" | "files" | "activity";

function ProjectInfoForm({ project, onSave, isPending }: { project: ProjectItem; onSave: (data: { status: string; progress: number; description?: string; startDate?: string; endDate?: string }) => void; isPending: boolean }) {
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
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="premium-input w-full h-24 resize-none"
              placeholder="Descripción del proyecto..."
            />
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
    { key: "activity", label: "Actividad", icon: <Activity className="w-4 h-4" /> },
  ];

  function handleSave(data: { status: string; progress: number; description?: string; startDate?: string; endDate?: string }) {
    updateMutation.mutate({ id, ...data }, { onSuccess: () => refetch() });
  }

  return (
    <div>
      <Link href="/admin/proyectos" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a proyectos
      </Link>

      <div className="flex gap-1 mb-8 p-1 bg-premium-darker rounded-xl border border-white/5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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

      {tab === "activity" && (
        <div className="premium-card">
          <ActivityTimeline projectId={id} limit={50} />
        </div>
      )}
    </div>
  );
}
