"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface LoginFormProps {
  redirectTo: string;
}

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-20, 20, -20],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
  },
};

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
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-radial from-premium-violet/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-premium-violet/10 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-premium-glow/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "1s" }} />

      <motion.div
        className="absolute top-1/4 right-[20%] w-20 h-20 glass rounded-2xl hidden md:block"
        variants={floatingVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="absolute bottom-1/3 left-[15%] w-16 h-16 glass rounded-full hidden md:block"
        variants={floatingVariants}
        initial="initial"
        animate="animate"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-10">
          <motion.h1
            className="text-5xl font-bold text-gradient mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            2bleA
          </motion.h1>
          <motion.p
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Iniciar sesión
          </motion.p>
        </div>

        <motion.div
          className="glass rounded-2xl p-8 border border-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="premium-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="premium-input w-full"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="premium-button w-full text-lg py-3">
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
