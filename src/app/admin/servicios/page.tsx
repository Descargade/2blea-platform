"use client";
import { useState } from "react";
import { useServices, useUpdateService, useCreateService, useDeleteService } from "@/hooks/queries/use-services";
import { PageHeader } from "@/components/shared/page-header";
import { CardSkeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { Modal } from "@/components/shared/modal";
import type { ServiceItem, ExtraItem } from "@/types";
import { Edit2, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface ExtraForm {
  id?: string;
  name: string;
  price: number;
}

function ExtraRow({
  ext,
  index,
  onChange,
  onRemove,
}: {
  ext: ExtraForm;
  index: number;
  onChange: (i: number, f: ExtraForm) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={ext.name}
        onChange={(e) => onChange(index, { ...ext, name: e.target.value })}
        className="premium-input flex-1 text-sm"
        placeholder="Nombre del extra"
      />
      <input
        type="number"
        min={0}
        value={ext.price}
        onChange={(e) => onChange(index, { ...ext, price: Number(e.target.value) })}
        className="premium-input w-24 text-sm"
        placeholder="Precio"
      />
      <button onClick={() => onRemove(index)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0">
        <Trash2 className="w-4 h-4 text-red-400" />
      </button>
    </div>
  );
}

export default function AdminServicios() {
  const { data: services, isLoading, isError, refetch } = useServices();
  const updateMutation = useUpdateService();
  const createMutation = useCreateService();
  const deleteMutation = useDeleteService();
  const list: ServiceItem[] = Array.isArray(services) ? services : [];

  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newActive, setNewActive] = useState(true);
  const [newExtras, setNewExtras] = useState<ExtraForm[]>([]);

  // Edit state
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editActive, setEditActive] = useState(true);
  const [editOrder, setEditOrder] = useState(0);
  const [editExtras, setEditExtras] = useState<ExtraForm[]>([]);

  function resetCreate() {
    setNewName("");
    setNewDesc("");
    setNewPrice(0);
    setNewActive(true);
    setNewExtras([]);
  }

  function openEdit(s: ServiceItem) {
    setEditing(s);
    setEditName(s.name);
    setEditDesc(s.description ?? "");
    setEditPrice(s.basePrice);
    setEditActive(s.active);
    setEditOrder(s.order);
    setEditExtras((s.extras ?? []).map((e) => ({ id: e.id, name: e.name, price: e.price })));
  }

  function closeEdit() {
    setEditing(null);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({
      name: newName.trim(),
      description: newDesc.trim() || undefined,
      basePrice: newPrice,
      active: newActive,
      extras: newExtras.length > 0 ? newExtras : undefined,
    });
    setShowCreate(false);
    resetCreate();
  }

  async function handleSave() {
    if (!editing) return;
    const changed: Parameters<typeof updateMutation.mutateAsync>[0] = { id: editing.id };
    if (editName !== editing.name) changed.name = editName;
    if (editDesc !== (editing.description ?? "")) changed.description = editDesc || undefined;
    if (editPrice !== editing.basePrice) changed.basePrice = editPrice;
    if (editActive !== editing.active) changed.active = editActive;
    if (editOrder !== editing.order) changed.order = editOrder;
    const origJson = JSON.stringify((editing.extras ?? []).map((e) => ({ id: e.id, name: e.name, price: e.price })));
    const editJson = JSON.stringify(editExtras);
    if (editJson !== origJson) changed.extras = editExtras;
    if (Object.keys(changed).length === 1) { closeEdit(); return; }
    await updateMutation.mutateAsync(changed);
    closeEdit();
  }

  async function handleDelete(s: ServiceItem) {
    if (!confirm(`¿Eliminar el servicio "${s.name}"? Se ocultará de la landing y no se podrá asignar a nuevos proyectos.`)) return;
    await deleteMutation.mutateAsync(s.id);
  }

  async function moveOrder(s: ServiceItem, dir: -1 | 1) {
    const idx = list.findIndex((x) => x.id === s.id);
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const other = list[target]!;
    await Promise.all([
      updateMutation.mutateAsync({ id: s.id, order: other.order }),
      updateMutation.mutateAsync({ id: other.id, order: s.order }),
    ]);
  }

  if (isError) return <ErrorState message="Error al cargar servicios" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Servicios"
        description={`${list.length} servicios disponibles`}
        action={
          <button onClick={() => { resetCreate(); setShowCreate(true); }} className="premium-button text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo servicio
          </button>
        }
      />

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nuevo servicio">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="premium-input w-full" placeholder="Nombre del servicio" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="premium-input w-full h-20 resize-none" placeholder="Descripción del servicio" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Precio base</label>
            <input type="number" min={0} value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} className="premium-input w-full" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={newActive} onChange={(e) => setNewActive(e.target.checked)} className="accent-premium-violet" />
            Activo
          </label>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Extras</label>
              <button
                type="button"
                onClick={() => setNewExtras([...newExtras, { name: "", price: 0 }])}
                className="text-xs text-premium-accent hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Agregar extra
              </button>
            </div>
            <div className="space-y-2">
              {newExtras.map((ext, i) => (
                <ExtraRow
                  key={i}
                  ext={ext}
                  index={i}
                  onChange={(idx, val) => {
                    const copy = [...newExtras];
                    copy[idx] = val;
                    setNewExtras(copy);
                  }}
                  onRemove={(idx) => setNewExtras(newExtras.filter((_, j) => j !== idx))}
                />
              ))}
              {newExtras.length === 0 && (
                <p className="text-xs text-gray-600">Sin extras adicionales</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="premium-button-outline text-sm">Cancelar</button>
            <button onClick={handleCreate} disabled={createMutation.isPending || !newName.trim()} className="premium-button text-sm">
              {createMutation.isPending ? "Guardando..." : "Crear servicio"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onClose={closeEdit} title={`Editar: ${editing?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="premium-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción</label>
            <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="premium-input w-full h-20 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Precio base</label>
              <input type="number" min={0} value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Orden</label>
              <input type="number" min={0} value={editOrder} onChange={(e) => setEditOrder(Number(e.target.value))} className="premium-input w-full" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="accent-premium-violet" />
            Activo
          </label>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-400">Extras</label>
              <button
                type="button"
                onClick={() => setEditExtras([...editExtras, { name: "", price: 0 }])}
                className="text-xs text-premium-accent hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Agregar extra
              </button>
            </div>
            <div className="space-y-2">
              {editExtras.map((ext, i) => (
                <ExtraRow
                  key={i}
                  ext={ext}
                  index={i}
                  onChange={(idx, val) => {
                    const copy = [...editExtras];
                    copy[idx] = val;
                    setEditExtras(copy);
                  }}
                  onRemove={(idx) => setEditExtras(editExtras.filter((_, j) => j !== idx))}
                />
              ))}
              {editExtras.length === 0 && (
                <p className="text-xs text-gray-600">Sin extras adicionales</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeEdit} className="premium-button-outline text-sm">Cancelar</button>
            <button onClick={handleSave} disabled={updateMutation.isPending} className="premium-button text-sm">
              {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : list.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-12">No hay servicios configurados</p>
        ) : (
          list.map((s, idx) => (
            <div key={s.id} className="premium-card relative" role="article" aria-label={s.name}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${s.active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
                    {s.active ? "Activo" : "Inactivo"}
                  </span>
                  <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">#{s.order}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveOrder(s, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-30"
                    aria-label="Mover arriba"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => moveOrder(s, 1)}
                    disabled={idx === list.length - 1}
                    className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-30"
                    aria-label="Mover abajo"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Editar servicio">
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    aria-label="Eliminar servicio"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.name}</h3>
              <p className="text-2xl font-bold text-premium-accent mb-4">
                ${s.basePrice?.toLocaleString("es-AR")}
              </p>
              {s.description && <p className="text-sm text-gray-400 mb-4">{s.description}</p>}
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