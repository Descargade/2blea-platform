"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useClients } from "@/hooks/queries/use-clients";
import { useProjects } from "@/hooks/queries/use-projects";
import { useConversations } from "@/hooks/queries/use-messages";
import { useOffers } from "@/hooks/queries/use-offers";
import { StatsGridSkeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { BarChart3, TrendingUp } from "lucide-react";
import type { ProjectItem, ConversationItem, OfferItem, ClientListItem } from "@/types";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { data: clients, isLoading: cLoad, isError: cErr, refetch: cRefetch } = useClients();
  const { data: projects, isLoading: pLoad, isError: pErr, refetch: pRefetch } = useProjects();
  const { data: convs, isLoading: mLoad, isError: mErr, refetch: mRefetch } = useConversations();
  const { data: offers, isLoading: oLoad, isError: oErr, refetch: oRefetch } = useOffers();

  const isLoading = cLoad || pLoad || mLoad || oLoad;
  const isError = cErr || pErr || mErr || oErr;
  const refetch = () => { cRefetch(); pRefetch(); mRefetch(); oRefetch(); };

  const cList = (Array.isArray(clients) ? clients : []) as ClientListItem[];
  const pList = (Array.isArray(projects) ? projects : []) as ProjectItem[];
  const mList = (Array.isArray(convs) ? convs : []) as ConversationItem[];
  const oList = (Array.isArray(offers) ? offers : []) as OfferItem[];

  const totalRevenue = pList.reduce((acc, p) => acc + (p.totalPaid ?? 0), 0);
  const pendingPayments = pList.reduce((acc, p) => {
    const paid = p.totalPaid ?? 0;
    const cost = p.cost ?? 0;
    return acc + Math.max(0, cost - paid);
  }, 0);

  const stats = {
    totalClients: cList.length,
    activeProjects: pList.filter((p) => p.status !== "OPTIMIZACION" && p.status !== "ENTREGADO").length,
    unreadMessages: mList.reduce((acc, conv) => {
      return acc + (conv.messages?.filter((m) => !m.read).length || 0);
    }, 0),
    activeOffers: oList.filter((o) => o.active).length,
    totalRevenue,
    pendingPayments,
  };

  if (isError) return <ErrorState message="Error al cargar estadísticas" onRetry={refetch} />;

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-400">Bienvenido, {session?.user?.name}</p>
      </div>
      {isLoading ? <StatsGridSkeleton /> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "Clientes totales", value: stats.totalClients, color: "text-premium-accent" },
              { label: "Proyectos activos", value: stats.activeProjects, color: "text-blue-400" },
              { label: "Mensajes no leídos", value: stats.unreadMessages, color: "text-yellow-400" },
              { label: "Ofertas activas", value: stats.activeOffers, color: "text-green-400" },
            ].map((s) => (
              <div key={s.label} className="premium-card" role="status" aria-label={s.label}>
                <p className="text-gray-400 text-sm mb-2">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="premium-card" role="status" aria-label="Ingresos totales">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <p className="text-gray-400 text-sm">Ingresos totales</p>
              </div>
              <p className="text-3xl font-bold text-green-400">${stats.totalRevenue.toLocaleString("es-AR")}</p>
              <p className="text-xs text-gray-600 mt-1">Suma de todos los pagos registrados</p>
            </div>
            <div className="premium-card" role="status" aria-label="Pagos pendientes">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                <p className="text-gray-400 text-sm">Pendiente de cobro</p>
              </div>
              <p className="text-3xl font-bold text-yellow-400">${stats.pendingPayments.toLocaleString("es-AR")}</p>
              <p className="text-xs text-gray-600 mt-1">Saldo total pendiente sobre proyectos</p>
            </div>
          </div>
        </>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card">
          <h3 className="text-lg font-semibold mb-4">Acciones rápidas</h3>
          <div className="space-y-3">
            <Link href="/admin/clientes" className="block premium-button-outline text-center" aria-label="Nuevo cliente">
              Nuevo cliente
            </Link>
            <Link href="/admin/proyectos" className="block premium-button-outline text-center" aria-label="Nuevo proyecto">
              Nuevo proyecto
            </Link>
            <Link href="/admin/ofertas" className="block premium-button-outline text-center" aria-label="Nueva oferta">
              Nueva oferta
            </Link>
          </div>
        </div>
        <div className="premium-card">
          <h3 className="text-lg font-semibold mb-4">Actividad reciente</h3>
          <p className="text-gray-500 text-sm">No hay actividad reciente.</p>
        </div>
      </div>
    </div>
  );
}
