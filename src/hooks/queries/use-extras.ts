"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useExtras(serviceId?: string) {
  const params = serviceId ? `?serviceId=${serviceId}` : "";
  return useQuery({
    queryKey: ["extras", serviceId ?? "all"],
    queryFn: async () => {
      const { data } = await api.get(`/extras${params}`);
      return data.data ?? data;
    },
    staleTime: 30_000,
  });
}

export function useCreateExtra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; price: number; serviceId: string }) => {
      const { data } = await api.post("/extras", input);
      return data.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extras"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useUpdateExtra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name?: string; price?: number; serviceId?: string }) => {
      const { data } = await api.put(`/extras/${input.id}`, input);
      return data.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extras"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export function useDeleteExtra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/extras/${id}`);
      return data.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extras"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
