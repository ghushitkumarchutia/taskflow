import { useEffect, useRef, useState, useCallback } from "react";
import type { JobStreamData, JobStatus } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "";
const API_KEY = import.meta.env.VITE_API_KEY || "";

/**
 * SSE streaming via fetch + ReadableStream — supports Authorization header
 * (native EventSource cannot send custom headers).
 * Auto-closes on terminal state or component unmount — zero memory leaks.
 */
export function useJobStream(jobId: string, currentStatus?: JobStatus) {
  const [streamData, setStreamData] = useState<JobStreamData | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const activeRef = useRef(false);

  const isTerminal = currentStatus === "COMPLETED" || currentStatus === "FAILED" || currentStatus === "CANCELLED";

  const cleanup = useCallback(() => {
    activeRef.current = false;
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!jobId || isTerminal) {
      cleanup();
      return;
    }

    // Prevent duplicate connections
    if (activeRef.current) return;
    activeRef.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    async function connect() {
      try {
        const response = await fetch(`${API_URL}/v1/jobs/${jobId}/stream`, {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          activeRef.current = false;
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (activeRef.current) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6)) as JobStreamData;
                setStreamData(parsed);

                if (
                  parsed.status === "COMPLETED" ||
                  parsed.status === "FAILED" ||
                  parsed.status === "CANCELLED"
                ) {
                  cleanup();
                  return;
                }
              } catch {
                // skip malformed SSE lines
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Expected on cleanup
          return;
        }
        activeRef.current = false;
      }
    }

    connect();

    return cleanup;
  }, [jobId, isTerminal, cleanup]);

  return streamData;
}
