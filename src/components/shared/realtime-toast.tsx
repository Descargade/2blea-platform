"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRealtimeNotifications } from "@/hooks/use-realtime";
import { X, MessageSquare, FileUp, RefreshCw, Percent, Bell } from "lucide-react";

interface Toast {
  id: string;
  type: string;
  title: string;
  message?: string | null;
  link?: string | null;
}

const icons: Record<string, React.ReactNode> = {
  NEW_MESSAGE: <MessageSquare className="w-4 h-4 text-cyan-400" />,
  FILE_UPLOADED: <FileUp className="w-4 h-4 text-premium-accent" />,
  PROJECT_UPDATED: <RefreshCw className="w-4 h-4 text-blue-400" />,
  PROGRESS_UPDATED: <RefreshCw className="w-4 h-4 text-purple-400" />,
  OFFER_CREATED: <Percent className="w-4 h-4 text-yellow-400" />,
};

export function RealtimeToasts() {
  const { data: session } = useSession();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((notification: Toast) => {
    setToasts((prev) => {
      const next = [notification, ...prev].slice(0, 5);
      return next;
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== notification.id));
    }, 5000);
  }, []);

  useRealtimeNotifications(session?.user?.id ?? "", addToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-start gap-3 p-4 bg-premium-darker border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-2 duration-300"
        >
          <div className="shrink-0 mt-0.5">{icons[toast.type] || <Bell className="w-4 h-4 text-gray-400" />}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{toast.title}</p>
            {toast.message && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{toast.message}</p>}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
}
