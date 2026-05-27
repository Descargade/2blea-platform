"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { redirect } from "next/navigation";
import { Camera, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => {
      const res = await api.put("/profile", data);
      return res.data;
    },
    onSuccess: () => {
      setSuccess("Perfil actualizado correctamente");
      setCurrentPassword("");
      setNewPassword("");
      update();
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Error al actualizar";
      alert(msg);
    },
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("avatar", file);
      const res = await api.post("/profile/avatar", form);
      return res.data;
    },
    onSuccess: () => {
      update();
      setSuccess("Avatar actualizado");
      setTimeout(() => setSuccess(""), 3000);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: { name?: string; email?: string; currentPassword?: string; newPassword?: string } = {};
    if (name !== session?.user?.name) data.name = name;
    if (email !== session?.user?.email) data.email = email;
    if (newPassword) {
      data.currentPassword = currentPassword;
      data.newPassword = newPassword;
    }
    if (Object.keys(data).length === 0) return;
    updateMutation.mutate(data);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Solo imágenes"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Máximo 5MB"); return; }
    avatarMutation.mutate(file);
  }

  if (status === "loading") return (
    <div className="min-h-screen bg-premium-black flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-premium-accent" />
    </div>
  );
  if (status === "unauthenticated") redirect("/admin/login");

  return (
    <div className="min-h-screen bg-premium-black">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href={session?.user?.role === "ADMIN" ? "/admin/dashboard" : "/cliente/dashboard"} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        <div className="mb-10 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-premium-darker border-2 border-white/10 overflow-hidden">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {session?.user?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-premium-violet hover:bg-premium-accent transition-colors shadow-lg"
              aria-label="Cambiar avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
          <p className="text-sm text-gray-500 capitalize">{session?.user?.role?.toLowerCase()}</p>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 rounded-xl px-4 py-3 mb-6">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="premium-card space-y-5">
          <h2 className="text-lg font-semibold">Información personal</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="premium-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="premium-input w-full" />
          </div>

          <hr className="border-white/5" />

          <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
          <p className="text-xs text-gray-500 -mt-3">Dejá estos campos en blanco si no querés cambiar la contraseña</p>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña actual</label>
            <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="premium-input w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nueva contraseña</label>
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="premium-input w-full" placeholder="Mínimo 6 caracteres" />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={updateMutation.isPending} className="premium-button flex items-center gap-2">
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
