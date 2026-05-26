"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useProjects } from "@/hooks/queries/use-projects";
import { PageHeader } from "@/components/shared/page-header";
import { CardSkeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import type { ProjectItem } from "@/types";

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

export default function ClienteDashboard() {
  const { data: session } = useSession();
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const list: ProjectItem[] = Array.isArray(projects) ? projects : [];

  if (isError) return <ErrorState message="Error al cargar proyectos" onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Mis proyectos" description={`Bienvenido, ${session?.user?.name}`} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : list.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-500">No tienes proyectos asignados todavía.</p>
          </div>
        ) : (
          list.map((p) => (
            <Link key={p.id} href={`/cliente/proyectos/${p.id}`} className="premium-card group" aria-label={`Ver proyecto ${p.name}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${statusStyles[p.status] || ""}`}>
                  {statusLabels[p.status] || p.status}
                </span>
                <span className="text-sm text-gray-500">{p.progress}%</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-premium-accent transition-colors">{p.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">{p.description}</p>
              <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-premium-violet rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
