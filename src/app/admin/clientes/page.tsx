"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/queries/use-clients";
import { PageHeader } from "@/components/shared/page-header";
import { TableSkeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Modal } from "@/components/shared/modal";
import { clientCreateSchema, type ClientCreateInput } from "@/lib/validations";
import type { ClientListItem } from "@/types";
import { Users, Search, Plus, Edit2 } from "lucide-react";

export default function AdminClientes() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClientListItem | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const { data: clients, isLoading, isError, refetch } = useClients();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  const form = useForm<ClientCreateInput>({
    resolver: zodResolver(clientCreateSchema),
    defaultValues: { name: "", email: "", phone: "", company: "" },
  });

  const editForm = useForm<ClientCreateInput>({
    defaultValues: { name: "", email: "", phone: "", company: "" },
  });

  async function onSubmit(data: ClientCreateInput) {
    const res = await createMutation.mutateAsync(data);
    setGeneratedPassword(res?.rawPassword || "");
    form.reset();
  }

  function openEdit(client: ClientListItem) {
    setEditing(client);
    editForm.reset({
      name: client.user?.name || "",
      email: client.user?.email || "",
      phone: client.phone || "",
      company: client.company || "",
    });
  }

  async function handleEditSave() {
    if (!editing) return;
    const data = editForm.getValues();
    await updateMutation.mutateAsync({ id: editing.id, ...data });
    setEditing(null);
  }

  const list: ClientListItem[] = Array.isArray(clients) ? clients : [];
  const filtered = list.filter((c) =>
    (c.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.user?.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.company || "").toLowerCase().includes(search.toLowerCase())
  );

  if (isError) return <ErrorState message="Error al cargar clientes" onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${list.length} clientes registrados`}
        action={
          <button onClick={() => setShowModal(true)} className="premium-button text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo cliente
          </button>
        }
      />

      <Modal open={showModal} onClose={() => { setShowModal(false); form.reset(); setGeneratedPassword(""); }} title="Nuevo cliente">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input {...form.register("name")} className="premium-input w-full" placeholder="Nombre del cliente" />
            {form.formState.errors.name && <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input {...form.register("email")} type="email" className="premium-input w-full" placeholder="email@ejemplo.com" />
            {form.formState.errors.email && <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
            <input {...form.register("phone")} className="premium-input w-full" placeholder="+5491112345678" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Empresa</label>
            <input {...form.register("company")} className="premium-input w-full" placeholder="Nombre de la empresa" />
          </div>
          {generatedPassword ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-sm text-green-400 font-semibold mb-1">Cliente creado</p>
              <p className="text-xs text-gray-400 mb-1">Contraseña autogenerada (guardala para compartir):</p>
              <p className="text-lg font-mono font-bold text-white select-all">{generatedPassword}</p>
              <button type="button" onClick={() => { setShowModal(false); form.reset(); setGeneratedPassword(""); }} className="premium-button text-sm w-full mt-3">
                Cerrar
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowModal(false); form.reset(); }} className="premium-button-outline text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={createMutation.isPending} className="premium-button text-sm">
                {createMutation.isPending ? "Guardando..." : "Crear cliente"}
              </button>
            </div>
          )}
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar cliente">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input {...editForm.register("name")} className="premium-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input {...editForm.register("email")} type="email" className="premium-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
            <input {...editForm.register("phone")} className="premium-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Empresa</label>
            <input {...editForm.register("company")} className="premium-input w-full" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="premium-button-outline text-sm">Cancelar</button>
            <button onClick={handleEditSave} disabled={updateMutation.isPending} className="premium-button text-sm">
              {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </Modal>

      <div className="premium-card p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="premium-input w-full pl-10"
              aria-label="Buscar clientes"
            />
          </div>
        </div>
        {isLoading ? <TableSkeleton rows={4} /> : filtered.length === 0 ? (
          <EmptyState icon={<Users className="w-12 h-12" />} title="No se encontraron clientes" description={search ? "Intenta con otros términos de búsqueda" : "No hay clientes registrados aún"} />
        ) : (
          <div className="overflow-x-auto" role="table" aria-label="Lista de clientes">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                  <th className="p-4 font-medium" scope="col">Nombre</th>
                  <th className="p-4 font-medium" scope="col">Email</th>
                  <th className="p-4 font-medium" scope="col">Teléfono</th>
                  <th className="p-4 font-medium" scope="col">Empresa</th>
                  <th className="p-4 font-medium" scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{client.user?.name || "---"}</td>
                    <td className="p-4 text-gray-400">{client.user?.email || "---"}</td>
                    <td className="p-4 text-gray-400">{client.phone || "---"}</td>
                    <td className="p-4 text-gray-400">{client.company || "---"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(client)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label={`Editar cliente ${client.user?.name}`}>
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => { if (confirm("¿Eliminar este cliente?")) deleteMutation.mutate(client.id); }} className="text-red-400 hover:text-red-300 text-sm transition-colors" aria-label={`Eliminar cliente ${client.user?.name}`}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
