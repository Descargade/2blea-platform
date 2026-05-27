"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useConversations, useSendMessage, useCreateConversation } from "@/hooks/queries/use-messages";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/shared/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TypingIndicator } from "@/components/shared/typing-indicator";
import { useRealtimeMessages, type RealtimeMessage } from "@/hooks/use-realtime";
import { useConversationTyping } from "@/hooks/use-realtime-typing";
import type { ConversationItem, MessageItem } from "@/types";
import { MessageSquare, Send, CheckCheck, Plus, X } from "lucide-react";
import api from "@/lib/api";

export default function AdminMensajes() {
  const { data: session } = useSession();
  const uid = session?.user?.id;
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<string, MessageItem[]>>({});
  const [showNewConv, setShowNewConv] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: convs, isLoading, isError, refetch } = useConversations();
  const sendMutation = useSendMessage();
  const createConv = useCreateConversation();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await api.get("/clients");
      return data.data ?? data;
    },
    enabled: showNewConv,
  });

  const list: ConversationItem[] = Array.isArray(convs) ? convs : [];
  const activeConv = list.find((c) => c.id === selected) || list[0];
  const messages = activeConv ? (localMessages[activeConv.id] ?? activeConv.messages ?? []) : [];

  useRealtimeMessages(uid ?? "", "ADMIN", useCallback((msg: RealtimeMessage) => {
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

  const { typingUsers, emitTyping } = useConversationTyping(
    activeConv?.id ?? "",
    uid ?? "",
    activeConv?.project?.id
  );

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

    const optimistic: MessageItem = {
      id: `opt-${Date.now()}`,
      conversationId: activeConv.id,
      senderId: uid ?? "",
      content: content.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => ({
      ...prev,
      [activeConv.id]: [...(prev[activeConv.id] ?? activeConv.messages ?? []), optimistic],
    }));

    emitTyping(false);
    sendMutation.mutate(
      { conversationId: activeConv.id, content: content.trim() },
      { onSuccess: () => { setContent(""); refetch(); } }
    );
  };

  const handleTyping = (value: string) => {
    setContent(value);
    if (value.trim()) {
      emitTyping(true);
    } else {
      emitTyping(false);
    }
  };

  if (isError) return <ErrorState message="Error al cargar mensajes" onRetry={refetch} />;

  return (
    <div>
      <PageHeader title="Mensajes" />
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 h-[calc(100dvh-11rem)] min-h-[350px] lg:min-h-[600px]">
        {/* Conversations sidebar */}
        <div className={`${showMobileList ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-80 premium-card p-0 overflow-y-auto flex-shrink-0 ${activeConv ? "lg:block" : ""}`}>
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Conversaciones</span>
            <button
              onClick={() => setShowNewConv(!showNewConv)}
              className="text-premium-accent hover:text-white transition-colors"
              aria-label="Nueva conversación"
            >
              {showNewConv ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
          {showNewConv ? (
            <div className="p-3 space-y-1">
              <p className="text-xs text-gray-500 mb-2">Seleccioná un cliente:</p>
              {!clients ? (
                <p className="text-xs text-gray-600">Cargando...</p>
              ) : (
                (Array.isArray(clients) ? clients : []).map((c: { id: string; user: { id: string; name: string; email: string } }) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      createConv.mutate({ clientId: c.id }, {
                        onSuccess: (conv: ConversationItem) => {
                          setSelected(conv.id);
                          setShowNewConv(false);
                          setLocalMessages({});
                        },
                      });
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors text-sm"
                  >
                    <p className="font-medium">{c.user.name}</p>
                    <p className="text-xs text-gray-600">{c.user.email}</p>
                  </button>
                ))
              )}
            </div>
          ) : isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={<MessageSquare className="w-8 h-8" />} title="Sin conversaciones" />
            </div>
          ) : (
            list.map((c) => {
              const unread = c.messages?.filter((m) => !m.read && m.senderId !== uid).length ?? 0;
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c.id); setLocalMessages({}); setShowMobileList(false); }}
                  className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${activeConv?.id === c.id ? "bg-white/10" : ""}`}
                  aria-label={`Conversación con ${c.client?.user?.name || "Cliente"}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{c.client?.user?.name || "Cliente"}</p>
                    {unread > 0 && (
                      <span className="text-[10px] bg-premium-accent text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{c.project?.name}</p>
                  {c.messages?.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {c.messages[c.messages.length - 1]?.content}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className={`${showMobileList && activeConv ? "hidden" : "flex"} lg:flex flex-1 premium-card p-0 flex flex-col`}>
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Seleccioná una conversación</p>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="lg:hidden text-gray-400 hover:text-white transition-colors"
                  aria-label="Volver a conversaciones"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                  <p className="font-semibold">{activeConv.client?.user?.name || "Cliente"}</p>
                  <p className="text-xs text-gray-500">{activeConv.project?.name}</p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-gray-500 text-center pt-16">No hay mensajes aún</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.senderId === uid ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          m.senderId === uid
                            ? "bg-premium-violet/20 border border-premium-violet/30 rounded-br-md"
                            : "bg-white/5 border border-white/10 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{m.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-gray-600">
                            {new Date(m.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {m.senderId === uid && (
                            <CheckCheck className={`w-3 h-3 ${m.read ? "text-blue-400" : "text-gray-600"}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <TypingIndicator names={typingUsers.map((u) => u.name)} />
              </div>

              <div className="border-t border-white/10 p-2 sm:p-4">
                <form onSubmit={handleSend} className="flex gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="premium-input flex-1"
                    aria-label="Mensaje"
                  />
                  <button
                    type="submit"
                    disabled={!content.trim() || sendMutation.isPending}
                    className="premium-button px-4"
                    aria-label="Enviar mensaje"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
