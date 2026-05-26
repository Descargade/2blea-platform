"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get("/projects");
      return data.data ?? data;
    },
    staleTime: 30_000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data.data ?? data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      clientId: string;
      serviceId?: string;
      cost?: number;
      extras?: Array<{ id: string; name: string; price: number }>;
      startDate?: string;
      endDate?: string;
    }) => {
      const { data } = await api.post("/projects", input);
      return data.data ?? data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: {
      id: string;
      name?: string;
      description?: string;
      status?: string;
      progress?: number;
      cost?: number;
      totalPaid?: number;
      startDate?: string;
      endDate?: string;
    }) => {
      const { data } = await api.put(`/projects/${id}`, input);
      return data.data ?? data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/projects/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
