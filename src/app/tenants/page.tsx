"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTenants } from "@/features/tenants/api";
import { tenantColumns } from "@/features/tenants/columns";
import { planValues, statusValues } from "@/features/tenants/schema";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";

export default function TenantsPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const { data, isLoading, isError } = useTenants({ status: status || undefined, plan: plan || undefined });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
        <Button asChild>
          <Link href="/tenants/new">
            <Plus className="h-4 w-4" />
            New tenant
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Filter label="Status" value={status} onChange={setStatus} options={["", ...statusValues]} />
        <Filter label="Plan" value={plan} onChange={setPlan} options={["", ...planValues]} />
      </div>

      {isError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
          Could not load tenants.
        </p>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={tenantColumns}
          data={data?.items ?? []}
          filterColumn="name"
          filterPlaceholder="Filter by name..."
          onRowClick={(t) => router.push(`/tenants/${t.id}`)}
          emptyMessage="No tenants"
        />
      )}
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <NativeSelect value={value} onChange={(e) => onChange(e.target.value)} className="w-40">
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "" ? "all" : o}
          </option>
        ))}
      </NativeSelect>
    </label>
  );
}
