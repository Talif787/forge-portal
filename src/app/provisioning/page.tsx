"use client";

import { useRouter } from "next/navigation";
import { ServerOff } from "lucide-react";
import { useWorkflows } from "@/features/provisioning/api";
import { workflowColumns } from "@/features/provisioning/columns";
import { ApiError } from "@/lib/api-client";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ProvisioningPage() {
  const router = useRouter();
  const { data, isLoading, error } = useWorkflows();
  const unavailable = error instanceof ApiError && error.status === 503;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Provisioning</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tenant provisioning workflows and their status, from the durable Temporal saga.
        </p>
      </div>

      {unavailable ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ServerOff className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Provisioning view unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Temporal is not reachable from this control plane. Catalog, tenants, and applications are unaffected.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
          Could not load provisioning workflows.
        </p>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={workflowColumns}
          data={data?.items ?? []}
          filterColumn="workflowId"
          filterPlaceholder="Filter by workflow id..."
          onRowClick={(w) => router.push(`/provisioning/${encodeURIComponent(w.workflowId)}`)}
          emptyMessage="No provisioning workflows yet"
        />
      )}
    </div>
  );
}
