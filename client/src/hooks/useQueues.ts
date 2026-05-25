import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { QueueStats } from "../types";

// ─── Queue stats ────────────────────────────────────────────────────

export function useQueueStats() {
  return useQuery<QueueStats[]>({
    queryKey: ["queueStats"],
    queryFn: () => api.get<QueueStats[]>("/v1/queue/stats"),
    staleTime: 5000,
    refetchInterval: 10000,
  });
}

// ─── Pause queue ────────────────────────────────────────────────────

export function usePauseQueue() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (name) => api.post<{ message: string }>(`/v1/queue/${name}/pause`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queueStats"] });
    },
  });
}

// ─── Resume queue ───────────────────────────────────────────────────

export function useResumeQueue() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (name) => api.post<{ message: string }>(`/v1/queue/${name}/resume`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queueStats"] });
    },
  });
}
