import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Service, serviceSchema } from "./schema";
import { catalogKeys } from "./api";

export const serviceKey = (id: string) => ["service", id] as const;

async function parseService(p: Promise<unknown>): Promise<Service> {
  return serviceSchema.parse(await p);
}

export function useService(id: string) {
  return useQuery({
    queryKey: serviceKey(id),
    queryFn: () => parseService(apiFetch(`services/${id}`)),
    enabled: Boolean(id),
  });
}

export interface CreateServiceInput {
  tenantId: string;
  name: string;
  tier: number;
  owningTeam: string;
  onCallRef?: string;
  description?: string;
  repository?: string;
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceInput) =>
      parseService(
        apiFetch("services", {
          method: "POST",
          headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.all }),
  });
}

// Optimistic lifecycle change: update the cached service immediately, roll back
// on error, and reconcile with the authoritative server response (which carries
// the new version) on success.
export function useChangeLifecycle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { lifecycle: string; version: number }) =>
      parseService(
        apiFetch(`services/${id}/lifecycle`, {
          method: "PATCH",
          headers: { "content-type": "application/json", "if-match": String(vars.version) },
          body: JSON.stringify({ lifecycle: vars.lifecycle }),
        }),
      ),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: serviceKey(id) });
      const previous = qc.getQueryData<Service>(serviceKey(id));
      if (previous) {
        qc.setQueryData<Service>(serviceKey(id), { ...previous, lifecycle: vars.lifecycle as Service["lifecycle"] });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(serviceKey(id), ctx.previous);
    },
    onSuccess: (updated) => qc.setQueryData(serviceKey(id), updated),
    onSettled: () => qc.invalidateQueries({ queryKey: catalogKeys.all }),
  });
}

export function useChangeOwnership(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { owningTeam: string; onCallRef: string; version: number }) =>
      parseService(
        apiFetch(`services/${id}/ownership`, {
          method: "PATCH",
          headers: { "content-type": "application/json", "if-match": String(vars.version) },
          body: JSON.stringify({ owningTeam: vars.owningTeam, onCallRef: vars.onCallRef }),
        }),
      ),
    onSuccess: (updated) => qc.setQueryData(serviceKey(id), updated),
    onSettled: () => qc.invalidateQueries({ queryKey: catalogKeys.all }),
  });
}

export function useRetireService(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { version: number }) =>
      apiFetch(`services/${id}`, { method: "DELETE", headers: { "if-match": String(vars.version) } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: catalogKeys.all });
      qc.invalidateQueries({ queryKey: serviceKey(id) });
    },
  });
}
