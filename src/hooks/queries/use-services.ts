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
    mutationFn: async (input: { id: string; basePrice: number; active: boolean }) => {
      const { data } = await api.put("/services", input);
      return data.data ?? data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}
