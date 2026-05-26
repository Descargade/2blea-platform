"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading";
import { Modal } from "@/components/shared/modal";
import { Shield, Phone, Mail, Building2, User, Key, Copy, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function ClienteConfiguracion() {
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [revealPw, setRevealPw] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/profile").then(({ data: res }) => {
      setProfile(res?.data || null);
    }).catch(() => {});
  }, []);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "loading") {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  const user = session?.user;
  const rawPassword = profile?.rawPassword || "";
  const clientPhone = profile?.client?.phone || profile?.phone || "";
  const clientCompany = profile?.client?.company || "";

  return (
    <div>
      <PageHeader title="Configuración" description="Tus datos personales y credenciales" />

      <Modal open={showPassword} onClose={() => { setShowPassword(false); setCopied(false); setRevealPw(false); }} title="Credenciales de acceso">
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-white font-mono text-lg">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Contraseña</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-mono text-lg select-all flex-1 break-all">
                  {revealPw ? (rawPassword || "No disponible") : "••••••••••"}
                </p>
                {rawPassword && (
                  <>
                    <button onClick={() => setRevealPw(!revealPw)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Mostrar/ocultar contraseña">
                      {revealPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button onClick={() => handleCopy(rawPassword)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Copiar contraseña">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </>
                )}
              </div>
              {copied && <p className="text-xs text-green-400 mt-1">¡Copiado!</p>}
              {!rawPassword && <p className="text-xs text-gray-500 mt-1">Comunicate con el administrador para recuperar tu contraseña.</p>}
            </div>
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
            <p className="text-white font-medium">{profile?.name || user?.name || "---"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-white font-medium">{profile?.email || user?.email || "---"}</p>
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
            <Phone className="w-5 h-5 text-premium-violet" />
            <h2 className="text-lg font-semibold">Contacto</h2>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Teléfono</p>
            <p className="text-white font-medium">{clientPhone || "---"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-white font-medium">{profile?.email || user?.email || "---"}</p>
          </div>

          {clientCompany && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Empresa</p>
              <p className="text-white font-medium">{clientCompany}</p>
            </div>
          )}

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Soporte</p>
            <p className="text-sm text-gray-400">Si necesitás ayuda, contactanos por:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <a href="https://wa.me/5492622530837" target="_blank" rel="noopener noreferrer" className="text-sm text-premium-accent hover:underline flex items-center gap-1">
                <Phone className="w-3 h-3" /> WhatsApp
              </a>
              <a href="mailto:gonzalezlucasaaron@gmail.com" className="text-sm text-premium-accent hover:underline flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
