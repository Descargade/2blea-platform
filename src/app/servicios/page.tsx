"use client";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import api from "@/lib/api";
import type { ServiceItem, ExtraItem } from "@/types";
import { Skeleton } from "@/components/shared/loading";
import { Check, ArrowRight, Sparkles, Monitor, Calendar, ShoppingCart, Building2, LayoutGrid, Globe, Zap, Plus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const serviceIcons: Record<string, React.ReactNode> = {
  "Landing Page Simple": <Monitor className="w-8 h-8" />,
  "Landing + Turnos + Confirmación": <Calendar className="w-8 h-8" />,
  "Página de Ventas": <ShoppingCart className="w-8 h-8" />,
  "Web para Negocios": <Building2 className="w-8 h-8" />,
  "Catálogo Online": <LayoutGrid className="w-8 h-8" />,
  "Sitio Web Profesional": <Globe className="w-8 h-8" />,
};

const serviceFeatures: Record<string, string[]> = {
  "Landing Page Simple": [
    "Diseño moderno y responsive",
    "Formulario de contacto",
    "Optimización SEO básica",
    "Hosting 1 año incluido",
    "Dominio .com.ar",
    "Integración redes sociales",
    "Carga rápida optimizada",
    "Analytics básico",
  ],
  "Landing + Turnos + Confirmación": [
    "Landing page profesional",
    "Sistema de turnos online",
    "Confirmación automática vía WhatsApp/Email",
    "Calendario de disponibilidad",
    "Notificaciones al cliente",
    "Panel de administración de turnos",
    "Historial de reservas",
    "Cancelación y reprogramación",
  ],
  "Página de Ventas": [
    "Copywriting persuasivo",
    "Diseño orientado a conversión",
    "Contador regresivo y scarcity",
    "Testimonios y prueba social",
    "Pasarela de pagos integrada",
    "Formulario de captura de leads",
    "Optimización móvil",
    "A/B testing ready",
  ],
  "Web para Negocios": [
    "Landing page principal",
    "Login de usuarios",
    "Panel administrador completo",
    "Base de datos",
    "Hosting y configuración",
    "Sección de servicios/productos",
    "Blog o noticias",
    "Soporte técnico 3 meses",
  ],
  "Catálogo Online": [
    "Galería de productos con imágenes",
    "Categorías y filtros",
    "Login de usuarios",
    "Hosting incluido",
    "Buscador interno",
    "WhatsApp directo por producto",
    "Panel para gestionar catálogo",
    "Modo vitrina / e-commerce",
  ],
  "Sitio Web Profesional": [
    "Hasta 10 páginas personalizadas",
    "Login de usuarios",
    "Panel administrador completo",
    "Base de datos",
    "Hosting y configuración",
    "Blog dinámico",
    "SEO avanzado",
    "Soporte técnico 6 meses",
  ],
};

const serviceDescriptions: Record<string, string> = {
  "Landing Page Simple":
    "Una landing page es tu carta de presentación digital. Una página única, elegante y optimizada para captar la atención de tus clientes ideales. Ideal para emprendedores, profesionales y negocios que quieren tener presencia web profesional sin complicaciones.",
  "Landing + Turnos + Confirmación":
    "Llevá tu landing al siguiente nivel con un sistema inteligente de turnos online. Tus clientes pueden reservar, recibir confirmación automática y reprogramar sin intervención tuya. Perfecto para peluquerías, consultorios, talleres y cualquier negocio que maneje turnos.",
  "Página de Ventas":
    "Una página de ventas es una máquina de conversión. Diseñada con copywriting estratégico, elementos de persuasión y un flujo optimizado para convertir visitantes en clientes. Ideal para lanzamientos, productos digitales y servicios premium.",
  "Web para Negocios":
    "Una web completa con panel administrador incluido. Gestioná tus contenidos, usuarios y servicios desde un backend fácil de usar. Perfecto para empresas, pymes y negocios que necesitan algo más que una página estática.",
  "Catálogo Online":
    "Mostrá tus productos como merecen. Un catálogo digital con galería de imágenes, categorías, buscador y la posibilidad de recibir consultas por WhatsApp directo desde cada producto. Ideal para comercios, marcas de indumentaria y fabricantes.",
  "Sitio Web Profesional":
    "El plan completo. Un sitio web institucional con hasta 10 páginas, blog dinámico, panel administrador y todo lo que tu negocio necesita para brillar online. La opción definitiva para empresas que quieren una presencia digital sólida y profesional.",
};

function ServiceIcon({ name }: { name: string }) {
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-premium-violet/20 to-premium-accent/10 flex items-center justify-center border border-premium-violet/20">
      {serviceIcons[name] || <Zap className="w-8 h-8 text-premium-accent" />}
    </div>
  );
}

export default function ServiciosPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["servicios-page"],
    queryFn: async () => {
      const res = await api.get("/services?active=true");
      return (res.data.data ?? res.data) as ServiceItem[];
    },
    staleTime: 120_000,
  });

  const services = (Array.isArray(data) ? data : []).sort((a, b) => a.order - b.order);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.querySelectorAll(".anim-up"),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
          }
        );
      }

      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, [headerRef, cardsRef.current.length]);

    return () => ctx.revert();
  }, [services]);

  return (
    <div className="min-h-screen bg-premium-black text-white">
      {/* Header */}
      <header className="relative py-16 sm:py-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-radial from-premium-violet/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-premium-violet/30 to-transparent" />
        <div className="absolute top-[20%] left-[15%] w-72 h-72 bg-premium-violet/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[15%] w-64 h-64 bg-premium-glow/8 rounded-full blur-[100px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="anim-up">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-premium-accent transition-colors mb-8"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Volver al inicio
            </Link>
          </div>
          <div ref={headerRef}>
            <span
              className="text-premium-accent text-sm uppercase tracking-[0.2em] mb-4 block anim-up"
            >
              Servicios
            </span>
            <h1
              className="text-5xl md:text-6xl font-bold mb-6 anim-up"
            >
              Soluciones <span className="text-gradient">digitales</span>
            </h1>
            <p
              className="text-gray-400 max-w-2xl mx-auto text-lg anim-up"
            >
              Cada servicio está diseñado para cubrir necesidades específicas. Elegí el que mejor se adapte a tu proyecto o consultanos para crear una solución a medida.
            </p>
          </div>
        </div>
      </header>

      {/* Services List */}
      <section className="relative py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-premium-darker/50 via-premium-black to-premium-darker/30" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 space-y-16 sm:space-y-24 lg:space-y-32">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="premium-card p-8 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : services.map((service, i) => {
                const features = serviceFeatures[service.name] || [];
                const desc = serviceDescriptions[service.name] || service.description;
                const isReversed = i % 2 === 1;

                return (
                  <div
                    key={service.id}
                    ref={(el) => { cardsRef.current[i] = el; }}
                  >
                    <div className={`flex flex-col ${isReversed ? "md:flex-row-reverse" : "md:flex-row"} gap-10 md:gap-16 items-center`}>
                      {/* Icon / Visual */}
                      <div className="w-full md:w-5/12">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-premium-violet/10 to-premium-accent/5 rounded-3xl blur-3xl" />
                          <div className="relative premium-card p-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-premium-violet/30 to-premium-accent/10 flex items-center justify-center border border-premium-violet/20 mb-6">
                              {serviceIcons[service.name] || <Zap className="w-10 h-10 text-premium-accent" />}
                            </div>
                            <div className="text-5xl font-bold text-gradient mb-2">
                              ${service.basePrice.toLocaleString("es-AR")}
                            </div>
                            <p className="text-gray-500 text-sm">Precio base</p>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="w-full md:w-7/12 space-y-6">
                        <div className="flex items-center gap-3">
                          <ServiceIcon name={service.name} />
                          <div>
                            <span className="text-xs text-gray-600 uppercase tracking-wider">
                              Servicio {String(i + 1).padStart(2, "0")}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold">{service.name}</h2>
                          </div>
                        </div>

                        <p className="text-gray-400 leading-relaxed text-lg">
                          {desc}
                        </p>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {features.map((feature) => (
                            <div key={feature} className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded-full bg-premium-violet/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-premium-accent" />
                              </div>
                              <span className="text-sm text-gray-300">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Extras */}
                        {service.extras && service.extras.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-premium-accent" />
                              Extras disponibles
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {service.extras.map((extra: ExtraItem) => (
                                <span
                                  key={extra.id}
                                  className="glass text-xs px-3 py-1.5 rounded-full text-gray-400 flex items-center gap-1.5"
                                >
                                  <Plus className="w-3 h-3 text-premium-accent" />
                                  {extra.name}
                                  <span className="text-gray-600">
                                    +${extra.price.toLocaleString("es-AR")}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <Link
                          href="/#presupuesto"
                          className="inline-flex items-center gap-2 premium-button px-6 py-3 mt-4"
                        >
                          Solicitar presupuesto
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {i < services.length - 1 && (
                      <div className="mt-16 border-t border-white/5" />
                    )}
                  </div>
                );
              })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative py-16 sm:py-24 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-premium-darker/30 to-premium-black" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-premium-violet/5 rounded-full blur-[150px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            ¿No encontrás lo que <span className="text-gradient">buscás</span>?
          </h2>
          <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto">
            Cada proyecto es único. Si ninguno de estos planes se ajusta a lo que necesitás, contactanos y armamos algo a medida.
          </p>
          <Link
            href="/#presupuesto"
            className="premium-button-outline text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            Hablamos de tu proyecto
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
