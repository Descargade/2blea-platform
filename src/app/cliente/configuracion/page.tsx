"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading";
import { Modal } from "@/components/shared/modal";
import { Shield, Phone, Mail, Info, ExternalLink, Key, Copy, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function ClienteConfiguracion() {
  const { data: session, status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [currentRawPw, setCurrentRawPw] = useState("");
  const [revealPw, setRevealPw] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get("/profile").then(({ data: res }) => {
      const pw = res?.data?.rawPassword || "";
      if (pw) setCurrentRawPw(pw);
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

  return (
    <div>
      <PageHeader title="Configuración" description="Datos de tu cuenta y soporte" />

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
                  {revealPw ? (currentRawPw || "No disponible") : "••••••••••"}
                </p>
                {currentRawPw && (
                  <>
                    <button onClick={() => setRevealPw(!revealPw)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Mostrar/ocultar contraseña">
                      {revealPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                    </button>
                    <button onClick={() => handleCopy(currentRawPw)} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Copiar contraseña">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </>
                )}
              </div>
              {copied && <p className="text-xs text-green-400 mt-1">¡Copiado!</p>}
              {!currentRawPw && <p className="text-xs text-gray-500 mt-1">Comunicate con el administrador para recuperar tu contraseña.</p>}
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
            <h2 className="text-lg font-semibold">Datos de la cuenta</h2>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nombre</p>
            <p className="text-white font-medium">{user?.name || "---"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-white font-medium">{user?.email || "---"}</p>
          </div>

          <button onClick={() => setShowPassword(true)} className="premium-button-outline w-full flex items-center justify-center gap-2">
            <Key className="w-4 h-4" />
            Ver contraseña
          </button>
        </div>

        <div className="premium-card space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-5 h-5 text-premium-violet" />
            <h2 className="text-lg font-semibold">Soporte</h2>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">WhatsApp</p>
            <a href="https://wa.me/5492622530837" target="_blank" rel="noopener noreferrer" className="premium-button flex items-center gap-2 w-full justify-center">
              <Phone className="w-4 h-4" />
              +54 9 2622 530837
            </a>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Email</p>
            <a href="mailto:gonzalezlucasaaron@gmail.com" className="premium-button-outline flex items-center gap-2 w-full justify-center">
              <Mail className="w-4 h-4" />
              gonzalezlucasaaron@gmail.com
            </a>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Enlaces útiles</p>
            <a href="/" target="_blank" rel="noopener noreferrer" className="premium-button-outline flex items-center gap-2 w-full justify-center">
              <ExternalLink className="w-4 h-4" />
              Calcular presupuesto
            </a>
          </div>
        </div>

        <div className="premium-card lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-premium-violet" />
            <h2 className="text-lg font-semibold">Información</h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Este es tu panel de cliente en 2bleA. Desde acá podés seguir el progreso de tus proyectos,
            comunicarte con el equipo, y acceder a los recursos compartidos.
            Si tenés alguna duda o necesitás asistencia, no dudes en contactarnos por WhatsApp o email.
          </p>
        </div>
      </div>
    </div>
  );
}
