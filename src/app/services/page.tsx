"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useServices } from "@/features/catalog/api";
import { serviceColumns } from "@/features/catalog/columns";
import { lifecycleValues } from "@/features/catalog/schema";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";

export default function ServicesPage() {
  const router = useRouter();
  const [lifecycle, setLifecycle] = useState("");
  const [tier, setTier] = useState("");
  const { data, isLoading, isError } = useServices({ lifecycle: lifecycle || undefined, tier: tier || undefined });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
        <Button asChild>
          <Link href="/services/new">
            <Plus className="h-4 w-4" />
            New service
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Filter label="Lifecycle" value={lifecycle} onChange={setLifecycle} options={["", ...lifecycleValues]} />
        <Filter label="Tier" value={tier} onChange={setTier} options={["", "1", "2", "3", "4"]} />
      </div>

      {isError && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
          Could not load services.
        </p>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={serviceColumns}
          data={data?.items ?? []}
          filterColumn="name"
          filterPlaceholder="Filter by name..."
          onRowClick={(s) => router.push(`/services/${s.id}`)}
          emptyMessage="No services"
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
