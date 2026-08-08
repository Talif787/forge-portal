import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { servicePageSchema } from "./schema";

export interface ServiceFilters {
  lifecycle?: string;
  tier?: string;
}

export const catalogKeys = {
  all: ["services"] as const,
  list: (filters: ServiceFilters) => ["services", "list", filters] as const,
};

export function useServices(filters: ServiceFilters = {}) {
  return useQuery({
    queryKey: catalogKeys.list(filters),
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.lifecycle) sp.set("lifecycle", filters.lifecycle);
      if (filters.tier) sp.set("tier", filters.tier);
      sp.set("limit", "100");
      const raw = await apiFetch<unknown>(`services?${sp.toString()}`);
      return servicePageSchema.parse(raw);
    },
  });
}
