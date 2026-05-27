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
import { ExternalLink, Settings } from "lucide-react";

const NotificationDropdown = dynamic(() => import("@/components/shared/notification-dropdown").then((m) => ({ default: m.NotificationDropdown })), { ssr: false });
const RealtimeToasts = dynamic(() => import("@/components/shared/realtime-toast").then((m) => ({ default: m.RealtimeToasts })), { ssr: false });
const RealtimeStatus = dynamic(() => import("@/components/shared/realtime-status").then((m) => ({ default: m.RealtimeStatus })), { ssr: false });

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-premium-violet border-t-transparent rounded-full animate-spin" role="status" aria-label="Cargando" />
      </div>
    );
  }

  if (pathname !== "/cliente/login" && status === "unauthenticated") redirect("/cliente/login");

  return (
    <div className="min-h-screen bg-premium-black">
      <header className="border-b border-white/10 bg-premium-darker/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/cliente/dashboard" className="text-xl font-bold text-gradient" aria-label="Ir al dashboard">
            2bleA
          </Link>
          <nav className="flex items-center gap-6" aria-label="Navegación principal">
            <Link
              href="/cliente/dashboard"
              className={`text-sm transition-colors ${pathname === "/cliente/dashboard" ? "text-white" : "text-gray-400 hover:text-white"}`}
              aria-current={pathname === "/cliente/dashboard" ? "page" : undefined}
            >
              Mis proyectos
            </Link>
            <Link
              href="/cliente/mensajes"
              className={`text-sm transition-colors ${pathname === "/cliente/mensajes" ? "text-white" : "text-gray-400 hover:text-white"}`}
              aria-current={pathname === "/cliente/mensajes" ? "page" : undefined}
            >
              Mensajes
            </Link>
            <Link
              href="/cliente/configuracion"
              className={`flex items-center gap-1 text-sm transition-colors ${pathname === "/cliente/configuracion" ? "text-white" : "text-gray-400 hover:text-white"}`}
              aria-current={pathname === "/cliente/configuracion" ? "page" : undefined}
            >
              <Settings className="w-3.5 h-3.5" />
              Configuración
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-premium-accent hover:text-premium-accent/80 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Presupuestos
            </a>
            <NotificationDropdown />
            <Link href="/api/auth/signout" className="text-sm text-gray-400 hover:text-white transition-colors">
              Cerrar sesión
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
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
      </main>
    </div>
  );
}
