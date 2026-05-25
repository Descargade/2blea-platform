import os, sys

root = r'C:\Users\aaron\2blea-platform'

def w(relpath, content):
    fp = os.path.join(root, relpath)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content.lstrip('\n'))
    print('OK:', relpath)

# Admin Ofertas
w('src/app/admin/ofertas/page.tsx', '''"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function AdminOfertas() {
  const { data: offers = [] } = useQuery({ queryKey: ["offers"], queryFn: () => api.get("/offers").then(r => r.data) });
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Ofertas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map(o => (
          <div key={o.id} className={`premium-card ${o.featured ? "border-premium-violet/40" : ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-1 rounded-full border ${o.active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>{o.active ? "Activa" : "Inactiva"}</span>
              {o.featured && <span className="text-xs px-2 py-1 rounded-full bg-premium-violet/20 text-premium-accent border border-premium-violet/30">Destacada</span>}
            </div>
            <h3 className="text-lg font-semibold mb-1">{o.title}</h3>
            <p className="text-2xl font-bold text-premium-accent mb-2">{o.discount}% OFF</p>
            <p className="text-sm text-gray-400 mb-3">{o.description}</p>
            {o.service && <p className="text-xs text-gray-500">Valido para: {o.service.name}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
''')

print('Offers done')


w('src/app/admin/mensajes/page.tsx', '''"use client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import api from "@/lib/api";

export default function AdminMensajes() {
  const { data: session } = useSession();
  const uid = (session?.user as any)?.id;
  const [sel, setSel] = useState(null);
  const [msg, setMsg] = useState("");
  const { data: convs = [] } = useQuery({ queryKey: ["admin-conversations"], queryFn: () => api.get("/messages").then(r => r.data) });
  const active = sel || convs[0];
  const msgs = active?.messages || [];

  const send = async (e) => { e.preventDefault(); if (!msg.trim() || !active) return; await api.post("/messages", { conversationId: active.id, content: msg }); setMsg(""); };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mensajes</h1>
      <div className="flex gap-6 h-[600px]">
        <div className="w-80 premium-card p-0 overflow-y-auto flex-shrink-0">
          {convs.map(c => (
            <button key={c.id} onClick={() => setSel(c)} className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 ${active?.id === c.id ? "bg-white/10" : ""}`}>
              <p className="font-medium text-sm">{c.client?.user?.name || "Cliente"}</p>
              <p className="text-xs text-gray-500 mt-1">{c.project?.name}</p>
              {c.messages?.length > 0 && <p className="text-xs text-gray-500 mt-1 truncate">{c.messages[c.messages.length - 1]?.content}</p>}
            </button>
          ))}
          {convs.length === 0 && <p className="text-gray-500 text-sm p-4">No hay conversaciones</p>}
        </div>
        <div className="flex-1 premium-card p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {msgs.map(m => (
              <div key={m.id} className={`flex ${m.senderId === uid ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.senderId === uid ? "bg-premium-violet/20 border border-premium-violet/30" : "bg-white/5 border border-white/10"}`}>
                  <p className="text-sm">{m.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(m.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
            {msgs.length === 0 && <p className="text-gray-500 text-center pt-16">Selecciona una conversacion</p>}
          </div>
          {active && (
            <div className="border-t border-white/10 p-4">
              <form onSubmit={send} className="flex gap-3">
                <input type="text" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Escribe un mensaje..." className="premium-input flex-1" />
                <button type="submit" className="premium-button" disabled={!msg.trim()}>Enviar</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
''')

print('Admin mensajes done')

w('src/app/cliente/mensajes/page.tsx', '''"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useState } from "react";
import api from "@/lib/api";

export default function ClienteMensajes() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const uid = (session?.user as any)?.id;
  const [msg, setMsg] = useState("");
  const { data: convs = [] } = useQuery({ queryKey: ["my-conversations", uid], queryFn: () => api.get("/messages").then(r => r.data), enabled: !!uid });
  const sendM = useMutation({ mutationFn: (c) => api.post("/messages", { conversationId: convs[0]?.id, content: c }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-conversations", uid] }); setMsg(""); } });
  const msgs = convs[0]?.messages || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mensajes</h1>
      <div className="premium-card p-0 flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {msgs.length === 0 && <p className="text-gray-500 text-center pt-16">No hay mensajes todavia.</p>}
          {msgs.map(m => (
            <div key={m.id} className={`flex ${m.senderId === uid ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.senderId === uid ? "bg-premium-violet/20 border border-premium-violet/30" : "bg-white/5 border border-white/10"}`}>
                <p className="text-sm">{m.content}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(m.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 p-4">
          <form onSubmit={e => { e.preventDefault(); if (msg.trim()) sendM.mutate(msg); }} className="flex gap-3">
            <input type="text" value={msg} onChange={e => setMsg(e.target.value)} placeholder="Escribe un mensaje..." className="premium-input flex-1" />
            <button type="submit" className="premium-button" disabled={!msg.trim()}>Enviar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
''')

print('Cliente mensajes done')

w('src/app/cliente/proyectos/page.tsx', '''"use client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import api from "@/lib/api";

const sc = { PENDIENTE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", EN_PROGRESO: "bg-blue-500/10 text-blue-500 border-blue-500/20", ESPERANDO_FEEDBACK: "bg-purple-500/10 text-purple-500 border-purple-500/20", FINALIZADO: "bg-green-500/10 text-green-500 border-green-500/20", ENTREGADO: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
const sl = { PENDIENTE: "Pendiente", EN_PROGRESO: "En progreso", ESPERANDO_FEEDBACK: "Esperando feedback", FINALIZADO: "Finalizado", ENTREGADO: "Entregado" };

export default function ClienteProyectos() {
  const { data: session } = useSession();
  const uid = (session?.user as any)?.id;
  const { data: projects = [] } = useQuery({ queryKey: ["my-projects", uid], queryFn: () => api.get("/projects").then(r => r.data), enabled: !!uid });
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Todos los proyectos</h1>
      <div className="space-y-4">
        {projects.map(p => (
          <Link key={p.id} href={`/cliente/proyectos/${p.id}`} className="premium-card flex items-center justify-between group">
            <div className="flex-1">
              <h3 className="font-semibold group-hover:text-premium-accent transition-colors">{p.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{p.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-1 rounded-full border ${sc[p.status] || ""}`}>{sl[p.status] || p.status}</span>
              <span className="text-sm text-gray-500">{p.progress}%</span>
            </div>
          </Link>
        ))}
        {projects.length === 0 && <p className="text-gray-500 text-center py-16">No tienes proyectos asignados.</p>}
      </div>
    </div>
  );
}
''')

print('Cliente proyectos list done')

w('src/app/cliente/proyectos/[id]/page.tsx', '''"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/api";

const sc = { PENDIENTE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", EN_PROGRESO: "bg-blue-500/10 text-blue-500 border-blue-500/20", ESPERANDO_FEEDBACK: "bg-purple-500/10 text-purple-500 border-purple-500/20", FINALIZADO: "bg-green-500/10 text-green-500 border-green-500/20", ENTREGADO: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
const sl = { PENDIENTE: "Pendiente", EN_PROGRESO: "En progreso", ESPERANDO_FEEDBACK: "Esperando feedback", FINALIZADO: "Finalizado", ENTREGADO: "Entregado" };

export default function ClienteProjectDetail() {
  const params = useParams();
  const { data: projects = [] } = useQuery({ queryKey: ["my-projects"], queryFn: () => api.get("/projects").then(r => r.data) });
  const p = projects.find(p => p.id === params.id);
  if (!p) return <div className="text-center py-16"><p className="text-gray-500">Cargando proyecto...</p></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold mb-2">{p.name}</h1><p className="text-gray-400">{p.description}</p></div>
        <span className={`text-sm px-3 py-1.5 rounded-full border ${sc[p.status] || ""}`}>{sl[p.status] || p.status}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-2">Progreso</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-premium-violet rounded-full" style={{ width: p.progress + "%" }} />
            </div>
            <span className="text-lg font-bold text-premium-accent">{p.progress}%</span>
          </div>
        </div>
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Inicio</p>
          <p className="font-semibold">{p.startDate ? new Date(p.startDate).toLocaleDateString("es-AR") : "---"}</p>
        </div>
        <div className="premium-card">
          <p className="text-gray-400 text-sm mb-1">Entrega estimada</p>
          <p className="font-semibold">{p.endDate ? new Date(p.endDate).toLocaleDateString("es-AR") : "---"}</p>
        </div>
      </div>
      <div className="premium-card">
        <h3 className="text-lg font-semibold mb-4">Archivos del proyecto</h3>
        {p.files?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {p.files.map(f => (
              <div key={f.id} className="glass rounded-xl p-4 text-center">
                <p className="text-sm font-medium truncate">{f.originalName}</p>
                <p className="text-xs text-gray-500 mt-1">{(f.size / 1024).toFixed(1)} KB</p>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">No hay archivos subidos todavia.</p>}
      </div>
    </div>
  );
}
''')

print('All pages generated!')

# Admin Dashboard
w('src/app/admin/dashboard/page.tsx', '''"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [clients, projects, messages, offers] = await Promise.all([
        api.get("/clients"), api.get("/projects"), api.get("/messages"), api.get("/offers")
      ]);
      return {
        totalClients: clients.data.length,
        activeProjects: projects.data.filter(p => p.status !== "FINALIZADO" && p.status !== "ENTREGADO").length,
        unreadMessages: messages.data.filter(m => !m.read).length,
        activeOffers: offers.data.filter(o => o.active).length,
      };
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Bienvenido, {session?.user?.name}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Clientes totales", value: stats?.totalClients, color: "text-premium-accent" },
          { label: "Proyectos activos", value: stats?.activeProjects, color: "text-blue-400" },
          { label: "Mensajes no leidos", value: stats?.unreadMessages, color: "text-yellow-400" },
          { label: "Ofertas activas", value: stats?.activeOffers, color: "text-green-400" },
        ].map(s => (
          <div key={s.label} className="premium-card">
            <p className="text-gray-400 text-sm mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value ?? "---"}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="premium-card">
          <h3 className="text-lg font-semibold mb-4">Acciones rapidas</h3>
          <div className="space-y-3">
            <Link href="/admin/clientes" className="block premium-button-outline text-center">Nuevo cliente</Link>
            <Link href="/admin/proyectos" className="block premium-button-outline text-center">Nuevo proyecto</Link>
            <Link href="/admin/ofertas" className="block premium-button-outline text-center">Nueva oferta</Link>
          </div>
        </div>
        <div className="premium-card">
          <h3 className="text-lg font-semibold mb-4">Actividad reciente</h3>
          <p className="text-gray-500 text-sm">No hay actividad reciente.</p>
        </div>
      </div>
    </div>
  );
}
''')

# Cliente Layout
w('src/app/cliente/layout.tsx', '''"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="min-h-screen bg-premium-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-premium-violet border-t-transparent rounded-full animate-spin" />
    </div>;
  }
  if (status === "unauthenticated") redirect("/login");

  return (
    <div className="min-h-screen bg-premium-black">
      <header className="border-b border-white/10 bg-premium-darker/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/cliente/dashboard" className="text-xl font-bold text-gradient">2bleA</Link>
          <nav className="flex items-center gap-6">
            <Link href="/cliente/dashboard" className={`text-sm ${pathname === "/cliente/dashboard" ? "text-white" : "text-gray-400 hover:text-white"}`}>Mis proyectos</Link>
            <Link href="/cliente/mensajes" className={`text-sm ${pathname === "/cliente/mensajes" ? "text-white" : "text-gray-400 hover:text-white"}`}>Mensajes</Link>
            <Link href="/api/auth/signout" className="text-sm text-gray-400 hover:text-white">Cerrar sesion</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
''')

# Cliente Dashboard
w('src/app/cliente/dashboard/page.tsx', '''"use client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import api from "@/lib/api";

const sc = { PENDIENTE: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", EN_PROGRESO: "bg-blue-500/10 text-blue-500 border-blue-500/20", ESPERANDO_FEEDBACK: "bg-purple-500/10 text-purple-500 border-purple-500/20", FINALIZADO: "bg-green-500/10 text-green-500 border-green-500/20", ENTREGADO: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
const sl = { PENDIENTE: "Pendiente", EN_PROGRESO: "En progreso", ESPERANDO_FEEDBACK: "Esperando feedback", FINALIZADO: "Finalizado", ENTREGADO: "Entregado" };

export default function ClienteDashboard() {
  const { data: session } = useSession();
  const uid = (session?.user as any)?.id;
  const { data: projects = [] } = useQuery({ queryKey: ["my-projects", uid], queryFn: () => api.get("/projects").then(r => r.data), enabled: !!uid });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis proyectos</h1>
        <p className="text-gray-400">Bienvenido, {session?.user?.name}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 && <div className="col-span-full text-center py-16"><p className="text-gray-500">No tienes proyectos asignados todavia.</p></div>}
        {projects.map(p => (
          <Link key={p.id} href={`/cliente/proyectos/${p.id}`} className="premium-card group">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-2 py-1 rounded-full border ${sc[p.status] || ""}`}>{sl[p.status] || p.status}</span>
              <span className="text-sm text-gray-500">{p.progress}%</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-premium-accent transition-colors">{p.name}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">{p.description}</p>
            <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-premium-violet rounded-full transition-all duration-500" style={{ width: p.progress + "%" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
''')

print('All missing files generated!')
