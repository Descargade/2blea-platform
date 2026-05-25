"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await api.get("/messages");
      return data.data ?? data;
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { conversationId: string; content: string }) => {
      const { data } = await api.post("/messages", input);
      return data.data ?? data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}
