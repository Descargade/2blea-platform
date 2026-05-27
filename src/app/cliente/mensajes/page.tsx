"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useConversations, useSendMessage, useCreateConversation } from "@/hooks/queries/use-messages";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading";
import { ErrorState } from "@/components/shared/error-state";
import { useRealtimeMessages, type RealtimeMessage } from "@/hooks/use-realtime";
import type { ConversationItem, MessageItem } from "@/types";
import { MessageSquare, Send } from "lucide-react";

export default function ClienteMensajes() {
  const { data: session } = useSession();
  const uid = session?.user?.id;
  const [content, setContent] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<string, MessageItem[]>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: convs, isLoading, isError, refetch } = useConversations();
  const sendMutation = useSendMessage();
  const createConv = useCreateConversation();

  const list: ConversationItem[] = Array.isArray(convs) ? convs : [];
  const activeConv = list[0];
  const messages: MessageItem[] = activeConv ? (localMessages[activeConv.id] ?? activeConv.messages ?? []) : [];

  useRealtimeMessages(uid ?? "", "CLIENTE", useCallback((msg: RealtimeMessage) => {
    if (!activeConv) return;
    if (msg.conversationId === activeConv.id) {
      setLocalMessages((prev) => {
        const key = msg.conversationId;
        const existing = prev[key] ?? activeConv.messages ?? [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [key]: [...existing, msg as MessageItem] };
      });
    }
  }, [activeConv]));

  useEffect(() => {
    if (!activeConv) return;
    setLocalMessages((prev) => {
      if (prev[activeConv.id]) return prev;
      return { ...prev, [activeConv.id]: activeConv.messages ?? [] };
    });
  }, [activeConv?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeConv) return;
    sendMutation.mutate(
      { conversationId: activeConv.id, content: content.trim() },
      { onSuccess: () => setContent("") }
    );
  };

  if (isError) return <ErrorState message="Error al cargar mensajes" onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Mensajes" />
      <div className="premium-card p-0 flex flex-col h-[calc(100dvh-12rem)] min-h-[350px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="space-y-4 pt-16">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className={`h-12 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-2xl`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 && !activeConv ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <MessageSquare className="w-16 h-16 text-gray-600" />
              <div className="text-center">
                <p className="text-gray-400 text-lg font-medium mb-1">No tenés conversaciones</p>
                <p className="text-gray-600 text-sm">Iniciá una conversación con el equipo de 2bleA</p>
              </div>
              <button
                onClick={() => createConv.mutate(undefined, { onSuccess: () => { refetch(); } })}
                disabled={createConv.isPending}
                className="premium-button px-6 py-3"
              >
                {createConv.isPending ? "Creando..." : "Iniciar conversación"}
              </button>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderId === uid ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  m.senderId === uid
                    ? "bg-premium-violet/20 border border-premium-violet/30"
                    : "bg-white/5 border border-white/10"
                }`}>
                  <p className="text-sm">{m.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        {activeConv && (
          <div className="border-t border-white/10 p-2 sm:p-4">
            <form onSubmit={handleSend} className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="premium-input flex-1"
                aria-label="Mensaje"
              />
              <button type="submit" className="premium-button" disabled={!content.trim() || sendMutation.isPending}>
                {sendMutation.isPending ? "Enviando..." : "Enviar"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
