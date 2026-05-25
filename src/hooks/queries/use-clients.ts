"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await api.get("/clients");
      return data.data ?? data;
    },
    staleTime: 30_000,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; email: string; phone?: string; company?: string }) => {
      const { data } = await api.post("/clients", input);
      return data.data ?? data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/clients/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}
