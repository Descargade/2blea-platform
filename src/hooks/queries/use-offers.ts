"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useOffers() {
  return useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data } = await api.get("/offers");
      return data.data ?? data;
    },
    staleTime: 60_000,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string; discount: number; description?: string; featured?: boolean;
      serviceId?: string; startDate?: string; endDate?: string;
    }) => {
      const { data } = await api.post("/offers", input);
      return data.data ?? data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offers"] }),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/offers/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["offers"] }),
  });
}
