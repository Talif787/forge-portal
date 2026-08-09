import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api-client";
import { applicationPageSchema, applicationSchema } from "./schema";

export const applicationKeys = {
  all: ["applications"] as const,
  list: (namespace?: string) => ["applications", "list", namespace ?? ""] as const,
  detail: (namespace: string, name: string) => ["application", namespace, name] as const,
};

// 503 means the control plane has no cluster configured. That is a definitive
// state, not a transient failure, so we do not retry it.
function retryUnlessUnavailable(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status === 503) return false;
  return failureCount < 1;
}

export function useApplications(namespace?: string) {
  return useQuery({
    queryKey: applicationKeys.list(namespace),
    queryFn: async () => {
      const q = namespace ? `?namespace=${encodeURIComponent(namespace)}` : "";
      return applicationPageSchema.parse(await apiFetch(`applications${q}`));
    },
    retry: retryUnlessUnavailable,
  });
}

export function useApplication(namespace: string, name: string) {
  return useQuery({
    queryKey: applicationKeys.detail(namespace, name),
    queryFn: async () => applicationSchema.parse(await apiFetch(`applications/${namespace}/${name}`)),
    enabled: Boolean(namespace && name),
    retry: retryUnlessUnavailable,
  });
}
