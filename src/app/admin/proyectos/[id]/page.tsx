"use client";
import { useParams } from "next/navigation";
import { useProject, useUpdateProject } from "@/hooks/queries/use-projects";
import { Skeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { FileUpload } from "@/components/shared/file-upload";
import { FileGallery } from "@/components/shared/file-gallery";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { Modal } from "@/components/shared/modal";
import { useRealtimeProject } from "@/hooks/use-realtime";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, RotateCcw, Plus, Trash2, Link2, Upload, Activity, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { ProjectItem, ProjectLink } from "@/types";

const stages = [
  { key: "CONSULTA", label: "Consulta", num: 1 },
  { key: "DISENO", label: "Diseño", num: 2 },
  { key: "DESARROLLO", label: "Desarrollo", num: 3 },
  { key: "REVISION", label: "Revisión", num: 4 },
  { key: "OPTIMIZACION", label: "Optimización", num: 5 },
  { key: "ENTREGADO", label: "Entregado", num: 6 },
];

const stageGradients: Record<string, string> = {
  CONSULTA: "from-violet-500 to-fuchsia-500",
  DISENO: "from-blue-500 to-cyan-500",
  DESARROLLO: "from-amber-500 to-orange-500",
  REVISION: "from-purple-500 to-pink-500",
  OPTIMIZACION: "from-emerald-500 to-teal-500",
  ENTREGADO: "from-green-500 to-emerald-500",
};

const statusBadge: {
  PAID: { label: string; class: string; icon: typeof CheckCircle2 };
  PENDING: { label: string; class: string; icon: typeof Clock };
  OVERDUE: { label: string; class: string; icon: typeof AlertCircle };
} = {
  PAID: { label: "Pagado", class: "bg-green-500/15 text-green-400 border-green-500/20", icon: CheckCircle2 },
  PENDING: { label: "Pendiente", class: "bg-amber-500/15 text-amber-400 border-amber-500/20", icon: Clock },
  OVERDUE: { label: "Vencido", class: "bg-red-500/15 text-red-400 border-red-500/20", icon: AlertCircle },
};

function PaymentCard({
  type,
  label,
  percentage,
  amount,
  status,
  onMarkPaid,
  paymentDate,
}: {
  type: string;
  label: string;
  percentage: number;
  amount: number;
  status: string;
  onMarkPaid: () => void;
  paymentDate?: string;
}) {
  const Badge = statusBadge[status as keyof typeof statusBadge] || statusBadge.PENDING;
  const Icon = Badge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">${amount.toLocaleString("es-AR")}</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${Badge.class}`}>
          <Icon className="w-3 h-3" />
          {Badge.label}
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-premium-violet to-premium-accent"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{percentage}% del total</span>
        {status === "PENDING" && (
          <button onClick={onMarkPaid} className="text-xs px-3 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
            Marcar pagado
          </button>
        )}
        {paymentDate && (
          <span className="text-xs text-gray-500">{new Date(paymentDate).toLocaleDateString("es-AR")}</span>
        )}
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-premium-violet/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
    </motion.div>
  );
}

function LinksSection({ project, onRefresh }: { project: ProjectItem; onRefresh: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  async function handleAdd() {
    await api.post(`/projects/${project.id}/links`, { url, title: title || url });
    setShowAdd(false); setUrl(""); setTitle("");
    onRefresh();
  }
  async function handleDelete(id: string) {
    await api.delete(`/projects/${project.id}/links/${id}`);
    onRefresh();
  }

  return (
    <div className="premium-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Link2 className="w-4 h-4 text-premium-violet" /> Links / Avances</h2>
        <button onClick={() => setShowAdd(true)} className="premium-button text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Agregar</button>
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
              <button onClick={() => handleDelete(link.id)} className="p-1 rounded hover:bg-white/10 transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
  const { data: session } = useSession();
  const { data: project, isLoading, isError, refetch } = useProject(id);
  const updateMutation = useUpdateProject();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"editor" | "files" | "links" | "activity">("editor");
  useRealtimeProject(id, session?.user?.id ?? "");
  const [dirty, setDirty] = useState(false);

  const [status, setStatus] = useState<string>("CONSULTA");
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cost, setCost] = useState(0);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState(0);
  const [newPaymentType, setNewPaymentType] = useState<"ANTICIPO" | "SALDO_FINAL" | "GENERAL">("GENERAL");
  const [newPaymentNote, setNewPaymentNote] = useState("");

  useEffect(() => {
    if (!project) return;
    setStatus(project.status);
    setProgress(project.progress);
    setStartDate((project.startDate || "").split("T")[0] ?? "");
    setEndDate((project.endDate || "").split("T")[0] ?? "");
    setCost(project.cost ?? 0);
  }, [project?.id]);

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /><Skeleton className="h-64 w-full" /></div>;
  if (isError) return <ErrorState message="Error al cargar proyecto" onRetry={refetch} />;
  if (!project) return <ErrorState message="Proyecto no encontrado" />;
  const p = project;

  const isDirty = status !== p.status || progress !== p.progress ||
    startDate !== (p.startDate ?? "") || endDate !== (p.endDate ?? "") ||
    cost !== (p.cost ?? 0);

  const paymentsArr = p.payments || [];
  const anticipoPaid = paymentsArr.find((pay) => pay.type === "ANTICIPO" && pay.status === "PAID");
  const saldoPaid = paymentsArr.find((pay) => pay.type === "SALDO_FINAL" && pay.status === "PAID");

  function handleSave() {
    updateMutation.mutate({ id, status, progress, startDate: startDate || undefined, endDate: endDate || undefined, cost: cost || undefined }, {
      onSuccess: () => { refetch(); setDirty(false); },
    });
  }

  function handleRestore() {
    setStatus(p.status);
    setProgress(p.progress);
    setStartDate(p.startDate ? String(p.startDate).split("T")[0] ?? "" : "");
    setEndDate(p.endDate ? String(p.endDate).split("T")[0] ?? "" : "");
    setCost(p.cost ?? 0);
    setDirty(false);
  }

  async function markPaymentPaid(type: string, amount: number) {
    await api.post(`/projects/${p.id}/payments`, { amount, type, note: `Pago ${type === "ANTICIPO" ? "anticipo" : type === "SALDO_FINAL" ? "saldo final" : "general"}` });
    refetch();
  }

  async function deletePayment(paymentId: string) {
    if (!confirm("¿Eliminar este pago?")) return;
    await api.delete(`/projects/${p.id}/payments/${paymentId}`);
    refetch();
  }

  async function handleAddPayment() {
    if (!newPaymentAmount || newPaymentAmount <= 0) return;
    await api.post(`/projects/${p.id}/payments`, { amount: newPaymentAmount, type: newPaymentType, note: newPaymentNote || undefined });
    setShowAddPayment(false);
    setNewPaymentAmount(0);
    setNewPaymentType("GENERAL");
    setNewPaymentNote("");
    refetch();
  }

  const tabs = [
    { key: "editor" as const, label: "Editor", icon: null },
    { key: "files" as const, label: "Archivos", icon: Upload },
    { key: "links" as const, label: "Links", icon: Link2 },
    { key: "activity" as const, label: "Actividad", icon: Activity },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <Link href="/admin/proyectos" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a proyectos
        </Link>
        <div className="flex items-center gap-2">
          {isDirty && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleRestore}
              className="premium-button-outline text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Restaurar
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="premium-button text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Guardando..." : "Guardar"}
          </motion.button>
        </div>
      </div>

      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold break-words">{project.name}</h1>
          <span className={`text-xs px-3 py-1 rounded-full border bg-gradient-to-r ${stageGradients[status as keyof typeof stageGradients] || "from-premium-violet to-premium-accent"} text-white w-fit`}>
            {stages.find(s => s.key === status)?.label || status}
          </span>
        </div>
        <p className="text-gray-400 text-sm">
          Cliente: {project.client?.user?.name || "Sin cliente"}
          {project.service ? ` · ${project.service.name}` : ""}
        </p>
      </motion.div>

      <div className="flex gap-1 mb-8 p-1 bg-premium-darker rounded-xl border border-white/5 w-full overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === t.key ? "bg-premium-violet/20 text-white border border-premium-violet/30" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "editor" && (
        <div className="space-y-6">
          {/* Stages + Progress Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stages */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="premium-card"
            >
              <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Etapa actual</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {stages.map((stage) => {
                  const isActive = status === stage.key;
                  const stageIndex = stages.findIndex(s => s.key === status);
                  const currentIndex = stages.findIndex(s => s.key === stage.key);
                  const isPast = currentIndex < stageIndex;
                  return (
                    <motion.button
                      key={stage.key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setStatus(stage.key); setDirty(true); setProgress(Math.min(currentIndex * 20 + 20, 100)); }}
                      className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-300 ${
                        isActive
                          ? "border-premium-violet/50 bg-premium-violet/15 shadow-lg shadow-premium-violet/20"
                          : isPast
                          ? "border-white/10 bg-white/5"
                          : "border-white/5 bg-transparent hover:bg-white/5"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isActive
                          ? "bg-gradient-to-br from-premium-violet to-premium-accent text-white shadow-lg shadow-premium-violet/30"
                          : isPast
                          ? "bg-white/10 text-white/60"
                          : "bg-white/5 text-gray-500"
                      }`}>
                        {isPast ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : stage.num}
                      </div>
                      <span className={`text-[10px] font-medium text-center leading-tight ${
                        isActive ? "text-white" : isPast ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {stage.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="stage-glow"
                          className="absolute inset-0 rounded-xl bg-premium-violet/5"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="premium-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm text-gray-400 uppercase tracking-wider">Progreso</h2>
                <span className="text-4xl font-bold bg-gradient-to-r from-premium-violet to-premium-accent text-transparent bg-clip-text">{progress}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-premium-violet via-purple-500 to-premium-accent"
                />
              </div>
              <input
                type="range" min={0} max={100} value={progress}
                onChange={(e) => { setProgress(Number(e.target.value)); setDirty(true); }}
                className="w-full accent-premium-violet mt-2"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </motion.div>
          </div>

          {/* Status + Dates Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="premium-card"
            >
              <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Estado visible</h2>
              <div className="flex flex-wrap gap-2">
                {stages.map((stage) => {
                  const isActive = status === stage.key;
                  return (
                    <motion.button
                      key={stage.key}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setStatus(stage.key); setDirty(true); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${stageGradients[stage.key] || "from-premium-violet to-premium-accent"} text-white border-transparent shadow-lg shadow-premium-violet/20`
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {stage.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Date */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="premium-card">
                  <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Inicio</h2>
                  <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setDirty(true); }} className="premium-input w-full" />
                </div>
                <div className="premium-card">
                  <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Entrega estimada</h2>
                  <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setDirty(true); }} className="premium-input w-full" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Costo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card"
          >
            <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Costo del proyecto</h2>
            <input type="number" min={0} value={cost} onChange={(e) => { setCost(Number(e.target.value)); setDirty(true); }} className="premium-input w-full max-w-xs" placeholder="0" />
          </motion.div>

          {/* Payments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm text-gray-400 uppercase tracking-wider">Pagos</h2>
              <button onClick={() => setShowAddPayment(true)} className="premium-button text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Agregar pago
              </button>
            </div>

            <Modal open={showAddPayment} onClose={() => setShowAddPayment(false)} title="Agregar pago">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                  <select value={newPaymentType} onChange={(e) => setNewPaymentType(e.target.value as any)} className="premium-input w-full">
                    <option value="GENERAL">Pago general</option>
                    <option value="ANTICIPO">Anticipo</option>
                    <option value="SALDO_FINAL">Saldo final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monto ($)</label>
                  <input type="number" min={1} value={newPaymentAmount} onChange={(e) => setNewPaymentAmount(Number(e.target.value))} className="premium-input w-full" placeholder="1000" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nota (opcional)</label>
                  <input type="text" value={newPaymentNote} onChange={(e) => setNewPaymentNote(e.target.value)} className="premium-input w-full" placeholder="Ej: Segunda cuota" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddPayment(false)} className="premium-button-outline text-sm">Cancelar</button>
                  <button onClick={handleAddPayment} disabled={!newPaymentAmount || newPaymentAmount <= 0} className="premium-button text-sm">Agregar</button>
                </div>
              </div>
            </Modal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <PaymentCard
                type="ANTICIPO"
                label="Anticipo (50%)"
                percentage={50}
                amount={cost ? cost * 0.5 : 0}
                status={anticipoPaid ? "PAID" : "PENDING"}
                onMarkPaid={() => markPaymentPaid("ANTICIPO", cost ? cost * 0.5 : 0)}
                paymentDate={anticipoPaid?.date}
              />
              <PaymentCard
                type="SALDO_FINAL"
                label="Saldo final (50%)"
                percentage={50}
                amount={cost ? cost * 0.5 : 0}
                status={saldoPaid ? "PAID" : "PENDING"}
                onMarkPaid={() => markPaymentPaid("SALDO_FINAL", cost ? cost * 0.5 : 0)}
                paymentDate={saldoPaid?.date}
              />
            </div>

            {paymentsArr.length > 0 && (
              <div className="premium-card">
                <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Todos los pagos registrados</h2>
                <div className="space-y-2">
                  {paymentsArr.map((pay) => (
                    <div key={pay.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-medium text-green-400">+${pay.amount.toLocaleString("es-AR")}</p>
                        <p className="text-xs text-gray-500">
                          {pay.type === "ANTICIPO" ? "Anticipo" : pay.type === "SALDO_FINAL" ? "Saldo final" : "General"}
                          {pay.note ? ` · ${pay.note}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${pay.status === "PAID" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                          {pay.status === "PAID" ? "Pagado" : "Pendiente"}
                        </span>
                        <span className="text-xs text-gray-600">{new Date(pay.date).toLocaleDateString("es-AR")}</span>
                        <button onClick={() => deletePayment(pay.id)} className="p-1 rounded hover:bg-white/10 transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "files" && (
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

      {activeTab === "links" && <LinksSection project={project} onRefresh={refetch} />}

      {activeTab === "activity" && (
        <div className="premium-card">
          <ActivityTimeline projectId={id} limit={50} />
        </div>
      )}
    </div>
  );
}
