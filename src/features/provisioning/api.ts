import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api-client";
import { workflowPageSchema, workflowSchema } from "./schema";

export const provisioningKeys = {
  all: ["provisioning"] as const,
  list: () => ["provisioning", "list"] as const,
  detail: (id: string) => ["provisioning", id] as const,
};

function retryUnlessUnavailable(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status === 503) return false;
  return failureCount < 1;
}

export function useWorkflows() {
  return useQuery({
    queryKey: provisioningKeys.list(),
    queryFn: async () => workflowPageSchema.parse(await apiFetch("provisioning/workflows")),
    retry: retryUnlessUnavailable,
    refetchInterval: 10_000,
  });
}

export function useWorkflow(workflowId: string) {
  return useQuery({
    queryKey: provisioningKeys.detail(workflowId),
    queryFn: async () => workflowSchema.parse(await apiFetch(`provisioning/workflows/${workflowId}`)),
    enabled: Boolean(workflowId),
    retry: retryUnlessUnavailable,
    refetchInterval: 10_000,
  });
}
