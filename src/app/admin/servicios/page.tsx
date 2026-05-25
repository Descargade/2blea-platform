"use client";
import { useState } from "react";
import { useServices, useUpdateService } from "@/hooks/queries/use-services";
import { PageHeader } from "@/components/shared/page-header";
import { CardSkeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { Modal } from "@/components/shared/modal";
import type { ServiceItem } from "@/types";
import { Edit2 } from "lucide-react";

export default function AdminServicios() {
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editActive, setEditActive] = useState(true);
  const { data: services, isLoading, isError, refetch } = useServices();
  const updateMutation = useUpdateService();

  const list: ServiceItem[] = Array.isArray(services) ? services : [];

  function openEdit(s: ServiceItem) {
    setEditing(s);
    setEditPrice(s.basePrice);
    setEditActive(s.active);
  }

  async function handleSave() {
    if (!editing) return;
    await updateMutation.mutateAsync({ id: editing.id, basePrice: editPrice, active: editActive });
    setEditing(null);
  }

  if (isError) return <ErrorState message="Error al cargar servicios" onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Servicios" description={`${list.length} servicios disponibles`} />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Editar: ${editing?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Precio base</label>
            <input
              type="number"
              min={0}
              value={editPrice}
              onChange={(e) => setEditPrice(Number(e.target.value))}
              className="premium-input w-full"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="accent-premium-violet" />
            Activo
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="premium-button-outline text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={updateMutation.isPending} className="premium-button text-sm">
              {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : list.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-12">No hay servicios configurados</p>
        ) : (
          list.map((s) => (
            <div key={s.id} className="premium-card" role="article" aria-label={s.name}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${s.active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
                  {s.active ? "Activo" : "Inactivo"}
                </span>
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Editar servicio">
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.name}</h3>
              <p className="text-2xl font-bold text-premium-accent mb-4">
                ${s.basePrice?.toLocaleString("es-AR")}
              </p>
              <p className="text-sm text-gray-400 mb-4">{s.description}</p>
              {s.extras?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Extras disponibles</p>
                  <div className="space-y-1">
                    {s.extras.map((e) => (
                      <div key={e.id} className="flex justify-between text-sm text-gray-400">
                        <span>{e.name}</span>
                        <span>${e.price?.toLocaleString("es-AR")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
