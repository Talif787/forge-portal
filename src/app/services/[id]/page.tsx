"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useService, useChangeLifecycle, useChangeOwnership, useRetireService } from "@/features/catalog/mutations";
import { lifecycleValues } from "@/features/catalog/schema";
import { ApiError } from "@/lib/api-client";
import { StatusBadge, TierBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: service, isLoading, isError } = useService(id);

  const lifecycle = useChangeLifecycle(id);
  const ownership = useChangeOwnership(id);
  const retire = useRetireService(id);

  const [owningTeam, setOwningTeam] = useState("");
  const [onCallRef, setOnCallRef] = useState("");
  const [ownershipDirty, setOwnershipDirty] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (isError || !service) {
    return (
      <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
        Could not load this service.
      </p>
    );
  }

  const team = ownershipDirty ? owningTeam : service.ownership.owningTeam;
  const oncall = ownershipDirty ? onCallRef : service.ownership.onCallRef ?? "";

  function fail(err: unknown, fallback: string) {
    toast.error(err instanceof ApiError ? err.message : fallback);
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{service.name}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{service.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={service.tier} />
          <StatusBadge value={service.lifecycle} />
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 pt-6 text-sm">
          <Row label="Tenant" value={service.tenantId} mono />
          <Row label="Owning team" value={service.ownership.owningTeam} />
          <Row label="On-call" value={service.ownership.onCallRef ?? "not set"} />
          <Row label="Repository" value={service.repository ?? "not set"} />
          <Row label="Version" value={String(service.version)} />
          <Row label="Updated" value={new Date(service.updatedAt).toLocaleString()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Change lifecycle</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {lifecycleValues.map((lc) => (
            <Button
              key={lc}
              variant={lc === service.lifecycle ? "secondary" : "outline"}
              size="sm"
              disabled={lifecycle.isPending || lc === service.lifecycle}
              onClick={() =>
                lifecycle.mutate(
                  { lifecycle: lc, version: service.version },
                  {
                    onSuccess: () => toast.success(`Lifecycle set to ${lc}`),
                    onError: (e) => fail(e, "Could not change lifecycle"),
                  },
                )
              }
            >
              {lc}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Change ownership</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label>Owning team</Label>
            <Input
              value={team}
              onChange={(e) => {
                setOwningTeam(e.target.value);
                if (!ownershipDirty) setOnCallRef(service.ownership.onCallRef ?? "");
                setOwnershipDirty(true);
              }}
              className="w-48"
            />
          </div>
          <div className="space-y-1.5">
            <Label>On-call ref</Label>
            <Input
              value={oncall}
              onChange={(e) => {
                setOnCallRef(e.target.value);
                setOwnershipDirty(true);
              }}
              className="w-48"
            />
          </div>
          <Button
            disabled={ownership.isPending}
            onClick={() =>
              ownership.mutate(
                { owningTeam: team, onCallRef: oncall, version: service.version },
                {
                  onSuccess: () => {
                    toast.success("Ownership updated");
                    setOwnershipDirty(false);
                  },
                  onError: (e) => fail(e, "Could not update ownership"),
                },
              )
            }
          >
            Save ownership
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={service.lifecycle === "retired"}>
                Retire service
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Retire {service.name}?</DialogTitle>
                <DialogDescription>
                  Retiring is a terminal lifecycle transition. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={retire.isPending}
                  onClick={() =>
                    retire.mutate(
                      { version: service.version },
                      {
                        onSuccess: () => {
                          toast.success("Service retired");
                          router.push("/services");
                        },
                        onError: (e) => fail(e, "Could not retire service"),
                      },
                    )
                  }
                >
                  {retire.isPending ? "Retiring..." : "Retire"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
