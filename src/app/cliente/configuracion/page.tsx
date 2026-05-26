"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading";
import { Modal } from "@/components/shared/modal";
import { Shield, Building2, Key, Copy, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function ClienteConfiguracion() {
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [revealPw, setRevealPw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/profile");
      setProfile(res?.data || null);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "loading" || loading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  const rawPassword = profile?.rawPassword || "";
  const clientPhone = profile?.client?.phone || profile?.phone || "";
  const clientCompany = profile?.client?.company || "";
  const company = profile?.companyContact || {};

  return (
    <div>
      <PageHeader title="Configuración" description="Tus datos personales y credenciales" />

      <Modal open={showPassword} onClose={() => { setShowPassword(false); setCopied(false); setRevealPw(false); }} title="Credenciales de acceso">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-white font-mono text-lg">{profile?.email || session?.user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contraseña</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-mono text-lg select-all flex-1 break-all">
                {revealPw ? rawPassword : "••••••••••"}
              </p>
              {rawPassword ? (
                <>
                  <button onClick={() => setRevealPw(!revealPw)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Mostrar/ocultar contraseña">
                    {revealPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button onClick={() => handleCopy(rawPassword)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Copiar contraseña">
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </>
              ) : (
                <p className="text-xs text-gray-500">No disponible</p>
              )}
            </div>
            {copied && <p className="text-xs text-green-400 mt-1">¡Copiado!</p>}
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => { setShowPassword(false); setCopied(false); setRevealPw(false); }} className="premium-button-outline text-sm">
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-premium-violet" />
            <h2 className="text-lg font-semibold">Mi cuenta</h2>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nombre</p>
            <p className="text-white font-medium">{profile?.name || session?.user?.name || "---"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-white font-medium">{profile?.email || session?.user?.email || "---"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Teléfono</p>
            <p className="text-white font-medium">{clientPhone || "---"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Empresa</p>
            <p className="text-white font-medium">{clientCompany || "---"}</p>
          </div>

          <button onClick={() => setShowPassword(true)} className="premium-button-outline w-full flex items-center justify-center gap-2">
            <Key className="w-4 h-4" />
            Ver contraseña
          </button>
        </div>

        <div className="premium-card space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-premium-violet" />
            <h2 className="text-lg font-semibold">Datos de contacto</h2>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nombre</p>
            <p className="text-white font-medium">{company.name || "2bleA"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-white font-medium">{company.email || "admin@2blea.com"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Teléfono</p>
            <p className="text-white font-medium">{company.phone || "---"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Empresa</p>
            <p className="text-white font-medium">{company.name || "2bleA"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
