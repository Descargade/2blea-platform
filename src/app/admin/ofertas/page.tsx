"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOffers, useCreateOffer, useDeleteOffer } from "@/hooks/queries/use-offers";
import { useServices } from "@/hooks/queries/use-services";
import { PageHeader } from "@/components/shared/page-header";
import { CardSkeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Modal } from "@/components/shared/modal";
import { offerCreateSchema, type OfferCreateInput } from "@/lib/validations";
import type { OfferItem } from "@/types";
import { Tag, Plus } from "lucide-react";

export default function AdminOfertas() {
  const [showModal, setShowModal] = useState(false);
  const { data: offers, isLoading, isError, refetch } = useOffers();
  const { data: services } = useServices();
  const createMutation = useCreateOffer();
  const deleteMutation = useDeleteOffer();

  const form = useForm<OfferCreateInput>({
    resolver: zodResolver(offerCreateSchema),
    defaultValues: { title: "", discount: 0, description: "", serviceId: "", startDate: "", endDate: "", active: true, featured: false },
  });

  async function onSubmit(data: OfferCreateInput) {
    await createMutation.mutateAsync(data);
    form.reset();
    setShowModal(false);
  }

  const list: OfferItem[] = Array.isArray(offers) ? offers : [];
  const serviceList = (Array.isArray(services) ? services : []).filter((s) => s.active);

  if (isError) return <ErrorState message="Error al cargar ofertas" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Ofertas"
        description={`${list.length} ofertas registradas`}
        action={
          <button onClick={() => setShowModal(true)} className="premium-button text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva oferta
          </button>
        }
      />

      <Modal open={showModal} onClose={() => { setShowModal(false); form.reset(); }} title="Nueva oferta">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Título</label>
            <input {...form.register("title")} className="premium-input w-full" placeholder="Ej: Descuento de lanzamiento" />
            {form.formState.errors.title && <p className="text-red-400 text-xs mt-1">{form.formState.errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descuento (%)</label>
            <input {...form.register("discount", { valueAsNumber: true })} type="number" min={0} max={100} className="premium-input w-full" />
            {form.formState.errors.discount && <p className="text-red-400 text-xs mt-1">{form.formState.errors.discount.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea {...form.register("description")} className="premium-input w-full h-20 resize-none" placeholder="Descripción breve de la oferta" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Servicio (opcional)</label>
            <select {...form.register("serviceId")} className="premium-input w-full">
              <option value="">Todos los servicios</option>
              {serviceList.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Inicio</label>
              <input {...form.register("startDate")} type="date" className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fin</label>
              <input {...form.register("endDate")} type="date" className="premium-input w-full" />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" {...form.register("active")} className="accent-premium-violet" />
              Activa
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" {...form.register("featured")} className="accent-premium-violet" />
              Destacada
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); form.reset(); }} className="premium-button-outline text-sm">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="premium-button text-sm">
              {createMutation.isPending ? "Guardando..." : "Crear oferta"}
            </button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : list.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon={<Tag className="w-12 h-12" />} title="No hay ofertas" description="Las ofertas y promociones aparecerán aquí" />
          </div>
        ) : (
          list.map((o) => (
            <div key={o.id} className={`premium-card ${o.featured ? "border-premium-violet/40" : ""}`} role="article" aria-label={o.title}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${o.active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
                  {o.active ? "Activa" : "Inactiva"}
                </span>
                {o.featured && (
                  <span className="text-xs px-2 py-1 rounded-full bg-premium-violet/20 text-premium-accent border border-premium-violet/30">
                    Destacada
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-1">{o.title}</h3>
              <p className="text-2xl font-bold text-premium-accent mb-2">{o.discount}% OFF</p>
              <p className="text-sm text-gray-400 mb-3">{o.description}</p>
              {o.service && <p className="text-xs text-gray-500 mb-3">Válido para: {o.service.name}</p>}
              <button
                onClick={() => { if (confirm("¿Eliminar esta oferta?")) deleteMutation.mutate(o.id); }}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
                aria-label={`Eliminar oferta ${o.title}`}
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
