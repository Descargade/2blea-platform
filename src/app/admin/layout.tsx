"use client";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PusherProvider } from "@/components/shared/pusher-provider";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { PageTransition } from "@/components/shared/page-transition";
import { RealtimeSubscriber } from "./realtime-subscriber";

const NotificationDropdown = dynamic(() => import("@/components/shared/notification-dropdown").then((m) => ({ default: m.NotificationDropdown })), { ssr: false });
const RealtimeToasts = dynamic(() => import("@/components/shared/realtime-toast").then((m) => ({ default: m.RealtimeToasts })), { ssr: false });
const RealtimeStatus = dynamic(() => import("@/components/shared/realtime-status").then((m) => ({ default: m.RealtimeStatus })), { ssr: false });

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "DS" },
  { href: "/admin/clientes", label: "Clientes", icon: "CL" },
  { href: "/admin/proyectos", label: "Proyectos", icon: "PR" },
  { href: "/admin/servicios", label: "Servicios", icon: "SV" },
  { href: "/admin/extras", label: "Extras", icon: "EX" },
  { href: "/admin/ofertas", label: "Ofertas", icon: "OF" },
  { href: "/admin/mensajes", label: "Mensajes", icon: "MS" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-premium-violet border-t-transparent rounded-full animate-spin" role="status" aria-label="Cargando" />
      </div>
    );
  }

  if (pathname !== "/admin/login" && (status === "unauthenticated" || session?.user?.role !== "ADMIN")) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-premium-black flex">
      <aside className="w-64 bg-premium-darker border-r border-white/10 flex flex-col" aria-label="Panel de navegación">
        <div className="p-4 border-b border-white/10">
          <Link href="/admin/dashboard" className="text-xl font-bold text-gradient" aria-label="Ir al dashboard">
            2bleA
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                  ${isActive ? "bg-premium-violet/20 text-white border border-premium-violet/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-xs font-mono bg-white/10 rounded px-1.5 py-0.5" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/perfil"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="text-xs" aria-hidden="true">PR</span>
            <span>Perfil</span>
          </Link>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="text-xs" aria-hidden="true">SAL</span>
            <span>Cerrar sesión</span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-30 bg-premium-black/80 backdrop-blur-xl border-b border-white/5 px-8 py-3 flex items-center justify-end gap-3">
          <span className="text-xs text-gray-600">{session?.user?.name}</span>
          <NotificationDropdown />
        </div>
        <div className="p-8">
          <PusherProvider>
            <RealtimeSubscriber />
            <RealtimeToasts />
            <RealtimeStatus />
            <ErrorBoundary>
              <PageTransition>
                {children}
              </PageTransition>
            </ErrorBoundary>
          </PusherProvider>
        </div>
      </main>
    </div>
  );
}
