"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Bell, Loader2, CheckCheck } from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  read: boolean;
  link?: string | null;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  NEW_MESSAGE: "💬",
  FILE_UPLOADED: "📁",
  PROJECT_UPDATED: "📋",
  PROGRESS_UPDATED: "📊",
  OFFER_CREATED: "🏷️",
};

function formatTime(date: string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60_000) return "Ahora";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications?limit=15");
      return res.data.data as { notifications: NotificationItem[]; unreadCount: number };
    },
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!notifications) return;
      await Promise.all(notifications.filter((n) => !n.read).map((n) => api.patch(`/notifications/${n.id}`)));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-premium-accent rounded-full text-[10px] font-bold flex items-center justify-center text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-premium-darker border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending} className="text-xs text-premium-accent hover:underline flex items-center gap-1">
                <CheckCheck className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm text-gray-500">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex gap-3 p-4 border-b border-white/5 transition-colors hover:bg-white/5 ${n.read ? "" : "bg-premium-violet/5"}`}
                >
                  <span className="text-lg shrink-0">{typeIcons[n.type] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? "text-gray-400" : "text-white font-medium"}`}>{n.title}</p>
                    {n.message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>}
                    <p className="text-[10px] text-gray-600 mt-1">{formatTime(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markRead.mutate(n.id)}
                      className="p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 self-start"
                      aria-label="Marcar como leída"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
