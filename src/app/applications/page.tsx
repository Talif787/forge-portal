"use client";

import { useRouter } from "next/navigation";
import { ServerOff } from "lucide-react";
import { useApplications } from "@/features/applications/api";
import { applicationColumns } from "@/features/applications/columns";
import { ApiError } from "@/lib/api-client";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ApplicationsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useApplications();
  const unavailable = error instanceof ApiError && error.status === 503;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live workloads reconciled by the operator, with their declared intent and current status.
        </p>
      </div>

      {unavailable ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ServerOff className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Applications view unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No Kubernetes cluster is configured for this control plane. Catalog and tenants are unaffected.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
          Could not load applications.
        </p>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          columns={applicationColumns}
          data={data?.items ?? []}
          filterColumn="name"
          filterPlaceholder="Filter by name..."
          onRowClick={(a) => router.push(`/applications/${a.namespace}/${a.name}`)}
          emptyMessage="No applications reconciled yet"
        />
      )}
    </div>
  );
}
