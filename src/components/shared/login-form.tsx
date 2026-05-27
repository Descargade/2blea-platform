"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  redirectTo: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Credenciales incorrectas"); setLoading(false); return; }
    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen bg-premium-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 bg-premium-glow animate-glow-pulse" />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">2bleA</h1>
          <p className="text-gray-400">Iniciar sesión</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="premium-input w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="premium-input w-full" required />
            </div>
            <button type="submit" disabled={loading} className="premium-button w-full text-lg">
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
