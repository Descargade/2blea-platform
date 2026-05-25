"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useConversations, useSendMessage } from "@/hooks/queries/use-messages";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import type { ConversationItem, MessageItem } from "@/types";
import { MessageSquare } from "lucide-react";

export default function ClienteMensajes() {
  const { data: session } = useSession();
  const uid = session?.user?.id;
  const [content, setContent] = useState("");
  const { data: convs, isLoading, isError, refetch } = useConversations();
  const sendMutation = useSendMessage();

  const list: ConversationItem[] = Array.isArray(convs) ? convs : [];
  const activeConv = list[0];
  const messages: MessageItem[] = activeConv?.messages || [];

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
      <div className="premium-card p-0 flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="space-y-4 pt-16">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                  <Skeleton className={`h-12 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-2xl`} />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <EmptyState icon={<MessageSquare className="w-12 h-12" />} title="No hay mensajes todavía" description="Envía un mensaje para comenzar la conversación" />
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
          <div className="border-t border-white/10 p-4">
            <form onSubmit={handleSend} className="flex gap-3">
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
