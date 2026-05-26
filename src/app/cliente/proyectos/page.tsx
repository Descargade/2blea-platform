"use client";
import Link from "next/link";
import { useProjects } from "@/hooks/queries/use-projects";
import { PageHeader } from "@/components/shared/page-header";
import { CardSkeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import type { ProjectItem } from "@/types";
import { FolderKanban } from "lucide-react";

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

export default function ClienteProyectos() {
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const list: ProjectItem[] = Array.isArray(projects) ? projects : [];

  if (isError) return <ErrorState message="Error al cargar proyectos" onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Todos los proyectos" description={`${list.length} proyectos`} />
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={<FolderKanban className="w-12 h-12" />} title="No tienes proyectos asignados" />
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <Link key={p.id} href={`/cliente/proyectos/${p.id}`} className="premium-card flex items-center justify-between group" aria-label={`Ver proyecto ${p.name}`}>
              <div className="flex-1">
                <h3 className="font-semibold group-hover:text-premium-accent transition-colors">{p.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{p.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-1 rounded-full border ${statusStyles[p.status] || ""}`}>
                  {statusLabels[p.status] || p.status}
                </span>
                <span className="text-sm text-gray-500">{p.progress}%</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
