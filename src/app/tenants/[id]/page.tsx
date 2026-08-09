"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useTenant, useChangeStatus, useUpdateQuota } from "@/features/tenants/mutations";
import { statusValues } from "@/features/tenants/schema";
import { ApiError } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tenant, isLoading, isError } = useTenant(id);
  const status = useChangeStatus(id);
  const quota = useUpdateQuota(id);

  const [maxServices, setMaxServices] = useState<string>("");
  const [quotaDirty, setQuotaDirty] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (isError || !tenant) {
    return (
      <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
        Could not load this tenant.
      </p>
    );
  }

  const quotaValue = quotaDirty ? maxServices : String(tenant.maxServices);

  function fail(err: unknown, fallback: string) {
    toast.error(err instanceof ApiError ? err.message : fallback);
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{tenant.name}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{tenant.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge value={tenant.plan} />
          <StatusBadge value={tenant.status} />
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-6 text-sm">
          <Row label="Slug" value={tenant.slug} mono />
          <Row label="Plan" value={tenant.plan} />
          <Row label="Max services" value={String(tenant.maxServices)} />
          <Row label="Version" value={String(tenant.version)} />
          <Row label="Created" value={new Date(tenant.createdAt).toLocaleString()} />
          <Row label="Updated" value={new Date(tenant.updatedAt).toLocaleString()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Change status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {statusValues.map((st) => (
            <Button
              key={st}
              variant={st === tenant.status ? "secondary" : "outline"}
              size="sm"
              disabled={status.isPending || st === tenant.status}
              onClick={() =>
                status.mutate(
                  { status: st, version: tenant.version },
                  {
                    onSuccess: () => toast.success(`Status set to ${st}`),
                    onError: (e) => fail(e, "Could not change status"),
                  },
                )
              }
            >
              {st}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Update quota</CardTitle>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label>Max services</Label>
            <Input
              type="number"
              value={quotaValue}
              onChange={(e) => {
                setMaxServices(e.target.value);
                setQuotaDirty(true);
              }}
              className="w-32"
            />
          </div>
          <Button
            disabled={quota.isPending}
            onClick={() =>
              quota.mutate(
                { maxServices: Number(quotaValue), version: tenant.version },
                {
                  onSuccess: () => {
                    toast.success("Quota updated");
                    setQuotaDirty(false);
                  },
                  onError: (e) => fail(e, "Could not update quota"),
                },
              )
            }
          >
            Save quota
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
