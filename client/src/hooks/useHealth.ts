import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { HealthResponse } from "../types";

export function useHealth() {
  return useQuery<HealthResponse>({
    queryKey: ["health"],
    queryFn: () => api.get<HealthResponse>("/health"),
    refetchInterval: 15000,
    retry: 1,
    staleTime: 10000,
  });
}
