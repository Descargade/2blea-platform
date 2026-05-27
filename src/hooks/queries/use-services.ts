"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await api.get("/services");
      return data.data ?? data;
    },
    staleTime: 60_000,
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      description?: string;
      basePrice?: number;
      active?: boolean;
      order?: number;
      extras?: { id?: string; name: string; price: number }[];
    }) => {
      const { data } = await api.put("/services", input);
      return data.data ?? data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      basePrice: number;
      active?: boolean;
      extras?: { name: string; price: number }[];
    }) => {
      const { data } = await api.post("/services", input);
      return data.data ?? data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/services/${id}`);
      return data.data ?? data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}
