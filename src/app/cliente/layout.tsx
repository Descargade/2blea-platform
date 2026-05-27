"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PusherProvider } from "@/components/shared/pusher-provider";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { PageTransition } from "@/components/shared/page-transition";
import { RealtimeSubscriber } from "./realtime-subscriber";
import { ExternalLink, Settings, Menu, X } from "lucide-react";

const NotificationDropdown = dynamic(() => import("@/components/shared/notification-dropdown").then((m) => ({ default: m.NotificationDropdown })), { ssr: false });
const RealtimeToasts = dynamic(() => import("@/components/shared/realtime-toast").then((m) => ({ default: m.RealtimeToasts })), { ssr: false });
const RealtimeStatus = dynamic(() => import("@/components/shared/realtime-status").then((m) => ({ default: m.RealtimeStatus })), { ssr: false });

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-premium-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-premium-violet border-t-transparent rounded-full animate-spin" role="status" aria-label="Cargando" />
      </div>
    );
  }

  if (pathname !== "/cliente/login" && status === "unauthenticated") redirect("/cliente/login");

  const navLinks = [
    { href: "/cliente/dashboard", label: "Mis proyectos" },
    { href: "/cliente/mensajes", label: "Mensajes" },
    { href: "/cliente/configuracion", label: "Configuración", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-premium-black">
      <header className="border-b border-white/10 bg-premium-darker/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/cliente/dashboard" className="text-xl font-bold text-gradient shrink-0" aria-label="Ir al dashboard">
            2bleA
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6" aria-label="Navegación principal">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 text-sm transition-colors whitespace-nowrap ${
                    pathname === link.href ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              );
            })}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-premium-accent hover:text-premium-accent/80 transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Presupuestos
            </a>
            <NotificationDropdown />
            <Link href="/api/auth/signout" className="text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap">
              Cerrar sesión
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationDropdown />
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Abrir menú">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-premium-darker/95 backdrop-blur-xl">
            <nav className="px-4 sm:px-6 py-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      pathname === link.href
                        ? "bg-premium-violet/20 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                );
              })}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-premium-accent hover:bg-white/5 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Presupuestos
              </a>
              <Link
                href="/api/auth/signout"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cerrar sesión
              </Link>
            </nav>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
