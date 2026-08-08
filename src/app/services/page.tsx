"use client";

import { useState } from "react";
import { useServices } from "@/features/catalog/api";
import { lifecycleValues } from "@/features/catalog/schema";
import { StatusBadge, TierBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesPage() {
  const [lifecycle, setLifecycle] = useState("");
  const [tier, setTier] = useState("");
  const { data, isLoading, isError } = useServices({ lifecycle: lifecycle || undefined, tier: tier || undefined });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">Services</h1>

      <div className="flex flex-wrap gap-3">
        <Filter label="Lifecycle" value={lifecycle} onChange={setLifecycle} options={["", ...lifecycleValues]} />
        <Filter label="Tier" value={tier} onChange={setTier} options={["", "1", "2", "3", "4"]} />
      </div>

      {isError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
          Could not load services.
        </p>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Lifecycle</th>
              <th className="px-4 py-3">Owning team</th>
              <th className="px-4 py-3">Version</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3" colSpan={5}><Skeleton className="h-5 w-full" /></td>
                </tr>
              ))
            ) : !data || data.items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No services</td></tr>
            ) : (
              data.items.map((s) => (
                <tr key={s.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3"><TierBadge tier={s.tier} /></td>
                  <td className="px-4 py-3"><StatusBadge value={s.lifecycle} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{s.ownership.owningTeam}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.version}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o === "" ? "all" : o}</option>
        ))}
      </select>
    </label>
  );
}
