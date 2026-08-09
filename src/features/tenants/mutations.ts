import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Tenant, tenantSchema } from "./schema";
import { tenantKeys } from "./api";

export const tenantKey = (id: string) => ["tenant", id] as const;

async function parseTenant(p: Promise<unknown>): Promise<Tenant> {
  return tenantSchema.parse(await p);
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKey(id),
    queryFn: () => parseTenant(apiFetch(`tenants/${id}`)),
    enabled: Boolean(id),
  });
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  plan: string;
  maxServices: number;
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTenantInput) =>
      parseTenant(
        apiFetch("tenants", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}

// Optimistic status change with rollback; reconciles to the server response
// (which carries the new version).
export function useChangeStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { status: string; version: number }) =>
      parseTenant(
        apiFetch(`tenants/${id}/status`, {
          method: "PATCH",
          headers: { "content-type": "application/json", "if-match": String(vars.version) },
          body: JSON.stringify({ status: vars.status }),
        }),
      ),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: tenantKey(id) });
      const previous = qc.getQueryData<Tenant>(tenantKey(id));
      if (previous) {
        qc.setQueryData<Tenant>(tenantKey(id), { ...previous, status: vars.status as Tenant["status"] });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(tenantKey(id), ctx.previous);
    },
    onSuccess: (updated) => qc.setQueryData(tenantKey(id), updated),
    onSettled: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}

export function useUpdateQuota(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { maxServices: number; version: number }) =>
      parseTenant(
        apiFetch(`tenants/${id}/quota`, {
          method: "PATCH",
          headers: { "content-type": "application/json", "if-match": String(vars.version) },
          body: JSON.stringify({ maxServices: vars.maxServices }),
        }),
      ),
    onSuccess: (updated) => qc.setQueryData(tenantKey(id), updated),
    onSettled: () => qc.invalidateQueries({ queryKey: tenantKeys.all }),
  });
}
