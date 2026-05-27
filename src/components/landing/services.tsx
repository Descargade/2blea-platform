"use client";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import api from "@/lib/api";
import type { ServiceItem } from "@/types";
import { Skeleton } from "@/components/shared/loading";
import { Check } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["landing-services"],
    queryFn: async () => {
      const res = await api.get("/services");
      return (res.data.data ?? res.data) as ServiceItem[];
    },
    staleTime: 120_000,
  });

  const services = Array.isArray(data) ? data : [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
              trigger: titleRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [services]);

  return (
    <section
      id="servicios"
      ref={sectionRef}
      className="relative py-16 sm:py-24 lg:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-premium-black via-premium-darker/50 to-premium-black" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div ref={titleRef} className="text-center mb-16">
          <motion.span
            className="text-premium-accent text-sm uppercase tracking-[0.2em] mb-4 block"
          >
            Servicios
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Soluciones <span className="text-gradient">digitales</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Desde landing pages hasta sistemas complejos, creamos la solución perfecta para tu proyecto.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="premium-card h-64">
                  <Skeleton className="h-4 w-20 mb-4" />
                  <Skeleton className="h-8 w-40 mb-4" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))
            : services.map((service, i) => (
                <div
                  key={service.id}
                  className="group premium-card relative overflow-hidden hover:border-premium-violet/30 transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-premium-violet/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="glass text-xs px-3 py-1 rounded-full text-gray-400">
                        Servicio {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-premium-accent transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-3xl font-bold text-premium-accent mb-4">
                      ${service.basePrice.toLocaleString("es-AR")}
                    </p>
                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {service.extras?.slice(0, 3).map((extra) => (
                        <span
                          key={extra.id}
                          className="glass text-xs px-2 py-1 rounded-full text-gray-500 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-premium-accent" />
                          {extra.name}
                        </span>
                      ))}
                      {(service.extras?.length ?? 0) > 3 && (
                        <span className="glass text-xs px-2 py-1 rounded-full text-gray-500">
                          +{service.extras!.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
