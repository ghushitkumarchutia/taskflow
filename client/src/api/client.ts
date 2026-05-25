import type { ApiErrorResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export class ApiError extends Error {
  statusCode: number;
  details?: Array<{ path: string; message: string }>;

  constructor(
    statusCode: number,
    message: string,
    details?: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${API_KEY}`,
    ...options.headers,
  };

  if (options.body && typeof options.body === "string") {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(
        response.status,
        response.statusText || "Request failed"
      );
    }
    throw new ApiError(
      response.status,
      errorData.message || errorData.error || "Request failed",
      errorData.details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// ─── Convenience methods ───────────────────────────────────────────

export const api = {
  get<T>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: "GET" });
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: "DELETE" });
  },
};
