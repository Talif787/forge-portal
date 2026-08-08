import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { tenantPageSchema } from "./schema";

export interface TenantFilters {
  status?: string;
  plan?: string;
}

export const tenantKeys = {
  all: ["tenants"] as const,
  list: (filters: TenantFilters) => ["tenants", "list", filters] as const,
};

export function useTenants(filters: TenantFilters = {}) {
  return useQuery({
    queryKey: tenantKeys.list(filters),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.status) sp.set("status", filters.status);
      if (filters.plan) sp.set("plan", filters.plan);
      sp.set("limit", "100");
      const raw = await apiFetch<unknown>(`tenants?${sp.toString()}`);
      return tenantPageSchema.parse(raw);
    },
  });
}
