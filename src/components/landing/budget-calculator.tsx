"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { budgetCreateSchema, type BudgetCreateInput } from "@/lib/validations";
import type { ServiceItem } from "@/types";
import { Skeleton } from "@/components/shared/loading";
import { Check, Send, CheckCircle, AlertCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const WHATSAPP_NUMBER = "5492622530837";
const BUDGET_EMAIL = "gonzalezlucasaaron@gmail.com";

const INCLUDED_EXTRAS: Record<string, string[]> = {
  "Landing + Turnos + Confirmación": ["Sistema de turnos Incluido", "Confirmación automática"],
  "Página de Ventas": ["Login de usuarios", "Panel administrador", "Base de datos", "Hosting / configuración"],
  "Web para Negocios": ["Login de usuarios", "Panel administrador", "Base de datos", "Hosting / configuración"],
  "Catálogo Online": ["Login de usuarios", "Hosting / configuración"],
  "Sitio Web Profesional": ["Login de usuarios", "Panel administrador", "Base de datos", "Hosting / configuración"],
};

export function BudgetCalculator() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const { data, isLoading } = useQuery({
    queryKey: ["budget-services"],
    queryFn: async () => {
      const res = await api.get("/services");
      return (res.data.data ?? res.data) as ServiceItem[];
    },
    staleTime: 120_000,
  });

  const services = (Array.isArray(data) ? data : []).filter((s) => s.active);

  const form = useForm<BudgetCreateInput>({
    resolver: zodResolver(budgetCreateSchema),
    defaultValues: { name: "", email: "", phone: "", service: "", extras: [], total: 0, message: "" },
  });

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const base = selectedServiceData?.basePrice ?? 0;
  const extrasTotal = selectedExtras.reduce((acc, id) => {
    const extra = selectedServiceData?.extras?.find((e) => e.id === id);
    return acc + (extra?.price ?? 0);
  }, 0);
  const computedTotal = base + extrasTotal;

  useEffect(() => {
    form.setValue("total", computedTotal);
    form.setValue("extras", selectedExtras);
  }, [computedTotal, selectedExtras, form]);

  function toggleExtra(extraId: string) {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  }

  useEffect(() => {
    if (selectedService) {
      form.setValue("service", selectedService);
    }
  }, [selectedService, form]);

  const submitMutation = useMutation({
    mutationFn: async (data: BudgetCreateInput) => {
      const res = await api.post("/budget", data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      const serviceName = selectedServiceData?.name ?? variables.service;
      const extrasList = selectedExtras
        .map((id) => selectedServiceData?.extras?.find((e) => e.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      const waMessage = encodeURIComponent(
        `¡Hola! Quiero contratar:\n\n*Servicio:* ${serviceName}\n*Extras:* ${extrasList || "Ninguno"}\n*Total:* $${variables.total.toLocaleString("es-AR")}\n\n*Nombre:* ${variables.name}\n*Email:* ${variables.email}\n*Teléfono:* ${variables.phone}\n*Mensaje:* ${variables.message ?? "Sin mensaje"}`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`, "_blank");
      window.open(`mailto:${BUDGET_EMAIL}?subject=Presupuesto 2bleA - ${serviceName}&body=${waMessage.replace(/\*/g, "").replace(/%0A/g, "%0D%0A")}`, "_blank");
      form.reset();
      setSelectedService(null);
      setSelectedExtras([]);
      setSubmitted(true);
    },
    onError: () => {
      setError(true);
    },
  });

  const [submitted, setSubmitted] = useState(false);
  const [hasError, setError] = useState(false);

  // Scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = sectionRef.current;
      if (!el) return;
      gsap.fromTo(
        el.querySelectorAll(".animate-in"),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (submitted) {
    return (
      <section id="presupuesto" ref={sectionRef} className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-premium-black to-premium-darker" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4">¡Presupuesto enviado!</h2>
          <p className="text-gray-400 mb-8">
            Te estamos redirigiendo a WhatsApp para confirmar los detalles. También te enviaremos un email con el resumen.
          </p>
          <button
            onClick={() => { setSubmitted(false); setError(false); }}
            className="premium-button-outline"
          >
            Solicitar otro presupuesto
          </button>
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section id="presupuesto" ref={sectionRef} className="relative py-32 overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Error al enviar</h2>
          <p className="text-gray-400 mb-8">Ocurrió un error al procesar tu solicitud. Intentá de nuevo.</p>
          <button onClick={() => setError(false)} className="premium-button">
            Intentar de nuevo
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="presupuesto" ref={sectionRef} className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-premium-darker via-premium-black to-premium-darker" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-premium-violet/30 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 animate-in">
          <span className="text-premium-accent text-sm uppercase tracking-[0.2em] mb-4 block">
            Presupuesto
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Calculá tu <span className="text-gradient">presupuesto</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Seleccioná los servicios que necesitás y recibí un presupuesto personalizado al instante.
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))}
          className="grid grid-cols-1 lg:grid-cols-5 gap-8"
        >
          <div className="lg:col-span-3 space-y-6 animate-in">
            <div className="premium-card">
              <h3 className="text-lg font-semibold mb-6">1. Elegí tu servicio</h3>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedService(s.id);
                        setSelectedExtras([]);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                        selectedService === s.id
                          ? "border-premium-violet bg-premium-violet/10"
                          : "border-white/10 bg-premium-glass hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-sm text-gray-500">{s.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-premium-accent font-bold">
                            ${s.basePrice.toLocaleString("es-AR")}
                          </span>
                          {selectedService === s.id && (
                            <Check className="w-5 h-5 text-premium-accent" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(() => {
              const service = selectedServiceData;
              if (!service) return null;
              return (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="premium-card"
                >
                  <h3 className="text-lg font-semibold mb-6">2. Extras</h3>

                  {service.extras?.length > 0 && (
                    <>
                      <p className="text-sm text-gray-400 mb-3">Opcionales para agregar:</p>
                      <div className="space-y-2 mb-6">
                        {service.extras.map((extra) => (
                          <button
                            key={extra.id}
                            type="button"
                            onClick={() => toggleExtra(extra.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                              selectedExtras.includes(extra.id)
                                ? "border-premium-violet/40 bg-premium-violet/5"
                                : "border-white/5 bg-premium-glass hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                  selectedExtras.includes(extra.id)
                                    ? "bg-premium-violet border-premium-violet"
                                    : "border-gray-600"
                                }`}
                              >
                                {selectedExtras.includes(extra.id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-sm">{extra.name}</span>
                            </div>
                            <span className="text-sm text-gray-400">
                              +${extra.price.toLocaleString("es-AR")}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {Boolean(INCLUDED_EXTRAS[service.name]?.length) && (
                    <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                      <p className="text-sm text-green-400 mb-2">✓ Incluidos en el servicio:</p>
                      <div className="flex flex-wrap gap-2">
                        {INCLUDED_EXTRAS[service.name]?.map((name) => (
                          <span key={name} className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-300">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              )})()}

            <div className="premium-card">
              <h3 className="text-lg font-semibold mb-6">3. Tus datos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  {...form.register("name")}
                  placeholder="Nombre completo"
                  className="premium-input w-full"
                  aria-label="Nombre"
                />
                {form.formState.errors.name && (
                  <p className="text-red-400 text-xs col-span-full">{form.formState.errors.name.message}</p>
                )}
                <input
                  {...form.register("email")}
                  placeholder="Email"
                  type="email"
                  className="premium-input w-full"
                  aria-label="Email"
                />
                {form.formState.errors.email && (
                  <p className="text-red-400 text-xs col-span-full">{form.formState.errors.email.message}</p>
                )}
                <input
                  {...form.register("phone")}
                  placeholder="Teléfono (opcional)"
                  className="premium-input w-full"
                  aria-label="Teléfono"
                />
              </div>
              <textarea
                {...form.register("message")}
                placeholder="Contanos sobre tu proyecto... (opcional)"
                className="premium-input w-full min-h-[100px] resize-none"
                aria-label="Mensaje"
              />
            </div>
          </div>

          <div className="lg:col-span-2 animate-in">
            <div className="premium-card sticky top-24">
              <h3 className="text-lg font-semibold mb-6">Resumen</h3>

              {!selectedService ? (
                <p className="text-gray-500 text-sm">Seleccioná un servicio para ver el resumen.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-start pb-4 border-b border-white/10">
                    <div>
                      <p className="text-sm text-gray-400">Servicio</p>
                      <p className="font-medium">{selectedServiceData?.name}</p>
                    </div>
                    <span className="text-premium-accent font-bold">
                      ${selectedServiceData?.basePrice.toLocaleString("es-AR") ?? 0}
                    </span>
                  </div>

                  {selectedExtras.length > 0 && (
                    <div className="space-y-2 pb-4 border-b border-white/10">
                      <p className="text-sm text-gray-400">Extras</p>
                      {selectedExtras.map((id) => {
                        const extra = selectedServiceData?.extras?.find((e) => e.id === id);
                        return (
                          <div key={id} className="flex justify-between text-sm text-gray-400">
                            <span>{extra?.name}</span>
                            <span>+${extra?.price.toLocaleString("es-AR") ?? 0}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <p className="text-lg font-semibold">Total</p>
                    <p className="text-2xl font-bold text-premium-accent">
                      ${computedTotal.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitMutation.isPending || !form.formState.isValid && form.formState.submitCount > 0}
                    className="premium-button w-full mt-4 flex items-center justify-center gap-2"
                  >
                    {submitMutation.isPending ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar presupuesto
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-600 text-center mt-2">
                    Te contactamos por WhatsApp y email
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
