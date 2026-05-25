"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/shared/loading";
import { Clock, FileUp, MessageSquare, RefreshCw, PlusCircle, UserPlus, Percent, Trash2 } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  details?: string | null;
  createdAt: string;
  user?: { id: string; name: string; image?: string | null } | null;
  project?: { id: string; name: string } | null;
}

const actionConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  PROJECT_CREATED: { icon: <PlusCircle className="w-4 h-4" />, color: "text-green-400 bg-green-500/10" },
  STATUS_CHANGED: { icon: <RefreshCw className="w-4 h-4" />, color: "text-blue-400 bg-blue-500/10" },
  PROGRESS_UPDATED: { icon: <RefreshCw className="w-4 h-4" />, color: "text-purple-400 bg-purple-500/10" },
  FILE_UPLOADED: { icon: <FileUp className="w-4 h-4" />, color: "text-premium-accent bg-premium-violet/10" },
  FILE_DELETED: { icon: <Trash2 className="w-4 h-4" />, color: "text-red-400 bg-red-500/10" },
  MESSAGE_SENT: { icon: <MessageSquare className="w-4 h-4" />, color: "text-cyan-400 bg-cyan-500/10" },
  OFFER_CREATED: { icon: <Percent className="w-4 h-4" />, color: "text-yellow-400 bg-yellow-500/10" },
  CLIENT_CREATED: { icon: <UserPlus className="w-4 h-4" />, color: "text-emerald-400 bg-emerald-500/10" },
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

export function ActivityTimeline({ projectId, limit = 20 }: { projectId?: string; limit?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["activity", projectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.set("projectId", projectId);
      params.set("limit", String(limit));
      const res = await api.get(`/activity?${params}`);
      return (res.data.data ?? []) as ActivityItem[];
    },
    staleTime: 15_000,
  });

  const items = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-10 h-10 mx-auto mb-3 text-gray-600" />
        <p className="text-sm text-gray-500">No hay actividad registrada aún</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-premium-violet/30 via-white/5 to-transparent" />
      <div className="space-y-0">
        {items.map((item) => {
          const config = actionConfig[item.action] || { icon: <Clock className="w-4 h-4" />, color: "text-gray-400 bg-white/5" };
          return (
            <div key={item.id} className="relative flex gap-4 pb-6 group">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.details || item.action}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-600">{item.user?.name || "Sistema"}</span>
                  <span className="text-[10px] text-gray-700">·</span>
                  <span className="text-xs text-gray-600">{formatTime(item.createdAt)}</span>
                  {item.project && (
                    <>
                      <span className="text-[10px] text-gray-700">·</span>
                      <span className="text-xs text-gray-600 truncate">{item.project.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
