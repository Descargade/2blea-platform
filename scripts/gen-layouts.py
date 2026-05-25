import os, base64, sys

root = r'C:\Users\aaron\2blea-platform'

files = {
    'src/app/admin/layout.tsx': '''
"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "\U0001f4ca" },
  { href: "/admin/clientes", label: "Clientes", icon: "\U0001f465" },
  { href: "/admin/proyectos", label: "Proyectos", icon: "\U0001f4c1" },
  { href: "/admin/servicios", label: "Servicios", icon: "\u2699\ufe0f" },
  { href: "/admin/ofertas", label: "Ofertas", icon: "\U0001f3f7\ufe0f" },
  { href: "/admin/mensajes", label: "Mensajes", icon: "\U0001f4ac" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="min-h-screen bg-premium-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-premium-violet border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-premium-black flex">
      <aside className="w-64 bg-premium-darker border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <Link href="/admin/dashboard" className="text-xl font-bold text-gradient">2bleA</Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200
                  ${isActive ? "bg-premium-violet/20 text-white border border-premium-violet/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <span>\U0001f6aa</span>
            <span>Cerrar sesi\u00f3n</span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
''',
}

for relpath, content in files.items():
    fp = os.path.join(root, relpath)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    with open(fp, 'w') as f:
        f.write(content.strip())
    print(f'Written: {relpath}')

print('Done!')
