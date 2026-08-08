import { useQuery } from "@tanstack/react-query";

export interface Health {
  ok: boolean;
  status: string;
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => fetch("/api/health", { cache: "no-store" }).then((r) => r.json() as Promise<Health>),
    refetchInterval: 15_000,
  });
}
