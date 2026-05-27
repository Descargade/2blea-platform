"use client";
import { useState } from "react";
import { useExtras, useCreateExtra, useUpdateExtra, useDeleteExtra } from "@/hooks/queries/use-extras";
import { useServices } from "@/hooks/queries/use-services";
import { PageHeader } from "@/components/shared/page-header";
import { CardSkeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { Modal } from "@/components/shared/modal";
import type { ServiceItem } from "@/types";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface ExtraWithService {
  id: string;
  name: string;
  price: number;
  serviceId: string;
  service: { id: string; name: string };
}

export default function AdminExtras() {
  const { data: extras, isLoading, isError, refetch } = useExtras();
  const { data: services } = useServices();
  const createMutation = useCreateExtra();
  const updateMutation = useUpdateExtra();
  const deleteMutation = useDeleteExtra();

  const list: ExtraWithService[] = Array.isArray(extras) ? extras : [];
  const serviceList: ServiceItem[] = Array.isArray(services) ? services : [];

  const [filterService, setFilterService] = useState<string>("");
  const filtered = filterService ? list.filter((e) => e.serviceId === filterService) : list;

  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newServiceId, setNewServiceId] = useState("");

  // Edit state
  const [editing, setEditing] = useState<ExtraWithService | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editServiceId, setEditServiceId] = useState("");

  function resetCreate() {
    setNewName("");
    setNewPrice(0);
    setNewServiceId(serviceList[0]?.id ?? "");
  }

  function openEdit(e: ExtraWithService) {
    setEditing(e);
    setEditName(e.name);
    setEditPrice(e.price);
    setEditServiceId(e.serviceId);
  }

  async function handleCreate() {
    if (!newName.trim() || !newServiceId) return;
    await createMutation.mutateAsync({ name: newName.trim(), price: newPrice, serviceId: newServiceId });
    setShowCreate(false);
    resetCreate();
  }

  async function handleSave() {
    if (!editing) return;
    await updateMutation.mutateAsync({ id: editing.id, name: editName, price: editPrice, serviceId: editServiceId });
    setEditing(null);
  }

  async function handleDelete(e: ExtraWithService) {
    if (!confirm(`¿Eliminar el extra "${e.name}"?`)) return;
    await deleteMutation.mutateAsync(e.id);
  }

  if (isError) return <ErrorState message="Error al cargar extras" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Extras"
        description={`${filtered.length} extras${filterService ? " filtrados" : ""}`}
        action={
          <button onClick={() => { resetCreate(); setShowCreate(true); }} className="premium-button text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo extra
          </button>
        }
      />

      {/* Service filter */}
      <div className="mb-6">
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="premium-input max-w-xs"
        >
          <option value="">Todos los servicios</option>
          {serviceList.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo extra">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="premium-input w-full" placeholder="Nombre del extra" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Precio</label>
            <input type="number" min={0} value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} className="premium-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Servicio</label>
            <select value={newServiceId} onChange={(e) => setNewServiceId(e.target.value)} className="premium-input w-full">
              <option value="">Seleccionar servicio</option>
              {serviceList.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="premium-button-outline text-sm">Cancelar</button>
            <button onClick={handleCreate} disabled={createMutation.isPending || !newName.trim() || !newServiceId} className="premium-button text-sm">
              {createMutation.isPending ? "Guardando..." : "Crear extra"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Editar: ${editing?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="premium-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Precio</label>
            <input type="number" min={0} value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className="premium-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Servicio</label>
            <select value={editServiceId} onChange={(e) => setEditServiceId(e.target.value)} className="premium-input w-full">
              {serviceList.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="premium-button-outline text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={updateMutation.isPending} className="premium-button text-sm">
              {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Extras list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No hay extras{filterService ? " para este servicio" : ""}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="premium-card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{e.name}</p>
                  <p className="text-xs text-gray-500">{e.service?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-premium-accent font-semibold">${e.price.toLocaleString("es-AR")}</span>
                <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Editar">
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(e)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
