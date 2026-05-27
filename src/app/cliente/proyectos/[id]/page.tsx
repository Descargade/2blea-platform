"use client";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useProjects } from "@/hooks/queries/use-projects";
import { useRealtimeProject } from "@/hooks/use-realtime";
import { CardSkeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, FileText, Link2, DollarSign, Package, Download, Film, Archive } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import type { ProjectItem } from "@/types";

const stages = [
  { key: "CONSULTA", label: "Consulta", num: 1, desc: "Relevamiento de requisitos y definición del alcance del proyecto." },
  { key: "DISENO", label: "Diseño", num: 2, desc: "Creación de wireframes, prototipos y diseño visual." },
  { key: "DESARROLLO", label: "Desarrollo", num: 3, desc: "Codificación, integración y construcción de la solución." },
  { key: "REVISION", label: "Revisión", num: 4, desc: "Control de calidad, ajustes finos y validación." },
  { key: "OPTIMIZACION", label: "Optimización", num: 5, desc: "Performance, accesibilidad y mejoras finales." },
  { key: "ENTREGADO", label: "Entregado", num: 6, desc: "Proyecto finalizado y entregado al cliente." },
];

const statusBadge: {
  PAID: { label: string; class: string; icon: typeof CheckCircle2 };
  PENDING: { label: string; class: string; icon: typeof Clock };
  OVERDUE: { label: string; class: string; icon: typeof AlertCircle };
} = {
  PAID: { label: "Pagado", class: "bg-green-500/15 text-green-400 border-green-500/20", icon: CheckCircle2 },
  PENDING: { label: "Pendiente", class: "bg-amber-500/15 text-amber-400 border-amber-500/20", icon: Clock },
  OVERDUE: { label: "Vencido", class: "bg-red-500/15 text-red-400 border-red-500/20", icon: AlertCircle },
};

const gradientForStage: Record<string, string> = {
  CONSULTA: "from-violet-500 to-fuchsia-500",
  DISENO: "from-blue-500 to-cyan-500",
  DESARROLLO: "from-amber-500 to-orange-500",
  REVISION: "from-purple-500 to-pink-500",
  OPTIMIZACION: "from-emerald-500 to-teal-500",
  ENTREGADO: "from-green-500 to-emerald-500",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function ClienteProjectDetail() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const projectId = params.id;
  const { data: projects, isLoading, isError, refetch } = useProjects();
  const list: ProjectItem[] = Array.isArray(projects) ? projects : [];
  const p = list.find((p) => p.id === projectId) ?? null;

  useRealtimeProject(projectId, session?.user?.id ?? "");

  useEffect(() => {
    const interval = setInterval(() => refetch(), 15000);
    return () => clearInterval(interval);
  }, [refetch]);

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

  const stageIndex = Math.max(0, stages.findIndex(s => s.key === p.status));
  const currentStage = (stages[stageIndex] || stages[0])!;
  const anticipo = p.payments?.find(pay => pay.type === "ANTICIPO");
  const saldo = p.payments?.find(pay => pay.type === "SALDO_FINAL");
  const incluidas = p.features ?? [];
  const extras = (p as any).extras ?? [];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={itemAnim}>
        <Link href="/cliente/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemAnim} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 break-words">{p.name}</h1>
          <p className="text-gray-400">{p.description}</p>
          {p.service && <p className="text-sm text-gray-500 mt-1">Servicio: {p.service.name}</p>}
        </div>
        <span className={`text-sm px-3 py-1.5 rounded-full border bg-gradient-to-r ${gradientForStage[p.status] || "from-premium-violet to-premium-accent"} text-white w-fit shrink-0`}>
          {currentStage.label}
        </span>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={itemAnim} className="premium-card mb-8 overflow-x-auto">
        <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-6">Timeline del proyecto</h2>
        <div className="flex items-start min-w-[600px] px-2">
          {stages.map((stage, idx) => {
            const isActive = idx === stageIndex;
            const isPast = idx < stageIndex;
            return (
              <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                <div className="flex items-center w-full">
                  <div className={`h-0.5 flex-1 ${idx === 0 ? "invisible" : ""} ${isPast || (isActive && idx <= stageIndex) ? "bg-gradient-to-r from-premium-violet to-premium-accent" : "bg-white/10"}`} />
                  <motion.div
                    animate={isActive ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0 0 rgba(108,59,217,0.4)", "0 0 0 8px rgba(108,59,217,0.1)", "0 0 0 0 rgba(108,59,217,0.4)"] } : {}}
                    transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                      isActive
                        ? "bg-gradient-to-br from-premium-violet to-premium-accent text-white shadow-lg shadow-premium-violet/30"
                        : isPast
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-white/5 text-gray-500 border border-white/10"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : stage.num}
                  </motion.div>
                  <div className={`h-0.5 flex-1 ${idx === stages.length - 1 ? "invisible" : ""} ${isPast || (isActive && idx < stageIndex) ? "bg-gradient-to-r from-premium-violet to-premium-accent" : "bg-white/10"}`} />
                </div>
                <p className={`text-xs mt-2 font-medium text-center ${isActive ? "text-white" : isPast ? "text-gray-400" : "text-gray-600"}`}>
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Current Stage Card */}
      <motion.div variants={itemAnim} className="premium-card mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-premium-violet/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex-1">
            <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-1">Etapa actual</h2>
            <h3 className="text-2xl font-bold mb-2">{currentStage.label}</h3>
            <p className="text-gray-400">{currentStage.desc}</p>
          </div>
          <div className="text-right ml-4">
            <p className="text-sm text-gray-400 mb-1">Progreso</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-premium-violet to-premium-accent text-transparent bg-clip-text">{p.progress}%</p>
            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden mt-2 ml-auto">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${p.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-premium-violet to-premium-accent"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info cards */}
      <motion.div variants={itemAnim} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Inicio</p>
          <p className="font-semibold">{p.startDate ? new Date(p.startDate).toLocaleDateString("es-AR") : "---"}</p>
        </div>
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Entrega estimada</p>
          <p className="font-semibold">{p.endDate ? new Date(p.endDate).toLocaleDateString("es-AR") : "---"}</p>
        </div>
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Progreso general</p>
          <p className="font-semibold">{p.progress}%</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Included Features */}
        <motion.div variants={itemAnim} className="premium-card">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-premium-violet" />
            <h3 className="text-lg font-semibold">Incluye</h3>
          </div>
          {incluidas.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Incluidos</p>
              <ul className="space-y-2">
                {incluidas.map((f: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {extras.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Extras</p>
              <ul className="space-y-2">
                {extras.map((e: { id: string; name: string; price?: number }, idx: number) => (
                  <li key={e.id || idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{e.name}{e.price ? ` ($${e.price.toLocaleString("es-AR")})` : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {incluidas.length === 0 && extras.length === 0 && (
            <p className="text-gray-500 text-sm">Sin incluir</p>
          )}
        </motion.div>

        {/* Price + Payments */}
        <motion.div variants={itemAnim} className="space-y-4">
          {/* Price Card */}
          <div className="premium-card">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-premium-violet" />
              <h3 className="text-lg font-semibold">Precio acordado</h3>
            </div>
            <p className="text-3xl font-bold">${(p.cost ?? 0).toLocaleString("es-AR")}</p>
            <p className="text-sm text-gray-500 mt-1">IVA incluido</p>
          </div>

          {/* Payment Status Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="premium-card flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Anticipo (50%)</p>
                <p className="text-lg font-semibold">${(p.cost ? p.cost * 0.5 : 0).toLocaleString("es-AR")}</p>
              </div>
              {(() => {
                const badge = statusBadge[anticipo ? "PAID" : "PENDING"] || statusBadge.PENDING;
                const Icon = badge.icon;
                return (
                  <span className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${badge.class}`}>
                    <Icon className="w-3 h-3" /> {badge.label}
                  </span>);
              })()}
            </div>
            <div className="premium-card flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Saldo final (50%)</p>
                <p className="text-lg font-semibold">${(p.cost ? p.cost * 0.5 : 0).toLocaleString("es-AR")}</p>
              </div>
              {(() => {
                const badge = statusBadge[saldo ? "PAID" : "PENDING"] || statusBadge.PENDING;
                const Icon = badge.icon;
                return (
                  <span className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${badge.class}`}>
                    <Icon className="w-3 h-3" /> {badge.label}
                  </span>
                );
              })()}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Files */}
      <motion.div variants={itemAnim} className="premium-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-premium-violet" />
          <h3 className="text-lg font-semibold">Archivos del proyecto</h3>
        </div>
        {p.files && p.files.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {p.files.map((f) => (
              <a
                key={f.id}
                href={`/api/upload/${f.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden bg-premium-darker border border-white/5 hover:border-premium-violet/20 transition-all duration-300 block"
              >
                {f.mimeType.startsWith("image/") ? (
                  <img src={`/api/upload/${f.key}`} alt={f.originalName} className="w-full h-full object-cover" />
                ) : f.mimeType.startsWith("video/") ? (
                  <div className="w-full h-full flex items-center justify-center bg-premium-black">
                    <Film className="w-10 h-10 text-gray-500" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="p-3 rounded-xl bg-premium-violet/10 inline-block mb-2">
                        {f.mimeType === "application/pdf" ? <FileText className="w-6 h-6" /> : <Archive className="w-6 h-6" />}
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs truncate text-gray-300">{f.originalName}</p>
                  <p className="text-[10px] text-gray-500">{(f.size / 1024).toFixed(1)} KB</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay archivos subidos todavía.</p>
        )}
      </motion.div>

      {/* Links */}
      {p.links && p.links.length > 0 && (
        <motion.div variants={itemAnim} className="premium-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-premium-violet" />
            <h3 className="text-lg font-semibold">Links / Avances</h3>
          </div>
          <div className="space-y-2">
            {p.links.map((link) => (
              <div key={link.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <Link2 className="w-4 h-4 text-gray-500 shrink-0" />
                <div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-premium-accent hover:underline text-sm font-medium">{link.title}</a>
                  <p className="text-xs text-gray-600">{new Date(link.createdAt).toLocaleDateString("es-AR")}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
