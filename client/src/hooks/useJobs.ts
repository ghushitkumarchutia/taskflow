import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type {
  Job,
  PaginatedJobs,
  JobListParams,
  CreateJobRequest,
  CreateJobResponse,
  DeadLetterEntry,
} from "../types";

// ─── List jobs with filters + pagination ────────────────────────────

export function useJobs(params: JobListParams) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.type) searchParams.set("type", params.type);

  return useQuery<PaginatedJobs>({
    queryKey: ["jobs", params],
    queryFn: () => api.get<PaginatedJobs>(`/v1/jobs?${searchParams.toString()}`),
    staleTime: 5000,
    refetchInterval: 10000,
  });
}

// ─── Get single job ─────────────────────────────────────────────────

export function useJob(id: string) {
  return useQuery<Job>({
    queryKey: ["job", id],
    queryFn: () => api.get<Job>(`/v1/jobs/${id}`),
    enabled: !!id,
    staleTime: 3000,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "COMPLETED" || status === "FAILED" || status === "CANCELLED") {
        return false;
      }
      return 5000;
    },
  });
}

// ─── Create job ─────────────────────────────────────────────────────

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation<CreateJobResponse, Error, CreateJobRequest>({
    mutationFn: (data) => api.post<CreateJobResponse>("/v1/jobs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["queueStats"] });
    },
  });
}

// ─── Cancel job ─────────────────────────────────────────────────────

export function useCancelJob() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string; job: Job }, Error, string>({
    mutationFn: (id) => api.delete<{ message: string; job: Job }>(`/v1/jobs/${id}`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["queueStats"] });
    },
  });
}

// ─── Retry job ──────────────────────────────────────────────────────

export function useRetryJob() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id) => api.post<{ message: string }>(`/v1/jobs/${id}/retry`),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["queueStats"] });
    },
  });
}

// ─── Dead letter queue ──────────────────────────────────────────────

export function useDeadLetterJobs() {
  return useQuery<{ data: DeadLetterEntry[]; total: number }>({
    queryKey: ["deadLetterJobs"],
    queryFn: () => api.get<{ data: DeadLetterEntry[]; total: number }>("/v1/jobs/dead-letter"),
    staleTime: 10000,
    refetchInterval: 15000,
  });
}
