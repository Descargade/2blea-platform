"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useProjects } from "@/hooks/queries/use-projects";
import { useRealtimeProject } from "@/hooks/use-realtime";
import { CardSkeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { FileGallery } from "@/components/shared/file-gallery";
import { ArrowLeft, FileText, Link2, DollarSign, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { ProjectItem } from "@/types";

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

export default function ClienteProjectDetail() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const list: ProjectItem[] = Array.isArray(projects) ? projects : [];
  const p = list.find((p) => p.id === params.id) ?? null;

  useRealtimeProject(params.id, session?.user?.id ?? "");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState message="Error al cargar proyecto" onRetry={refetch} />;
  if (!p) return <div className="text-center py-16"><p className="text-gray-500">Proyecto no encontrado</p></div>;

  const totalPaid = p.payments?.reduce((s, pay) => s + pay.amount, 0) ?? 0;
  const balance = (p.cost ?? 0) - totalPaid;

  return (
    <div>
      <Link href="/cliente/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a mis proyectos
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{p.name}</h1>
          <p className="text-gray-400">{p.description}</p>
          {p.service && (
            <p className="text-sm text-premium-accent mt-1">Servicio: {p.service.name}</p>
          )}
        </div>
        <span className={`text-sm px-3 py-1.5 rounded-full border ${statusStyles[p.status] || ""}`}>
          {statusLabels[p.status] || p.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-2">Progreso</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-premium-violet rounded-full transition-all" style={{ width: `${p.progress}%` }} />
            </div>
            <span className="text-lg font-bold text-premium-accent">{p.progress}%</span>
          </div>
        </div>
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Inicio</p>
          <p className="font-semibold">{p.startDate ? new Date(p.startDate).toLocaleDateString("es-AR") : "---"}</p>
        </div>
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Entrega estimada</p>
          <p className="font-semibold">{p.endDate ? new Date(p.endDate).toLocaleDateString("es-AR") : "---"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="premium-card">
          <h3 className="text-lg font-semibold mb-4">Archivos del proyecto</h3>
          {p.files && p.files.length > 0 ? (
            <div className="space-y-2">
              {p.files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm flex-1 truncate">{f.originalName}</span>
                  <span className="text-xs text-gray-600">{(f.size / 1024).toFixed(1)} KB</span>
                  <span className="text-xs text-gray-600">{new Date(f.createdAt).toLocaleDateString("es-AR")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay archivos subidos todavía.</p>
          )}
        </div>

        <div className="premium-card">
          <h3 className="text-lg font-semibold mb-4">Links / Avances</h3>
          {p.links && p.links.length > 0 ? (
            <div className="space-y-2">
              {p.links.map((link) => (
                <div key={link.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <Link2 className="w-4 h-4 text-gray-500" />
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-premium-accent hover:underline flex-1">
                    {link.title}
                  </a>
                  <ExternalLink className="w-3 h-3 text-gray-600" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay links de avance todavía.</p>
          )}
        </div>
      </div>

      <div className="premium-card mb-8">
        <h3 className="text-lg font-semibold mb-4">Pagos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-gray-400 text-xs mb-1">Costo total</p>
            <p className="text-xl font-bold">${(p.cost ?? 0).toLocaleString("es-AR")}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Pagado</p>
            <p className="text-xl font-bold text-green-400">${totalPaid.toLocaleString("es-AR")}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Saldo pendiente</p>
            <p className={`text-xl font-bold ${balance > 0 ? "text-yellow-400" : "text-green-400"}`}>
              ${balance.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
        {p.payments && p.payments.length > 0 ? (
          <div className="space-y-2">
            {p.payments.map((pay) => (
              <div key={pay.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">+${pay.amount.toLocaleString("es-AR")}</span>
                  {pay.note && <span className="text-xs text-gray-500">({pay.note})</span>}
                </div>
                <span className="text-xs text-gray-600">{new Date(pay.date).toLocaleDateString("es-AR")}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay pagos registrados.</p>
        )}
      </div>
    </div>
  );
}
