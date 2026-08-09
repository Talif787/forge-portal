"use client";

import { useParams } from "next/navigation";
import { ServerOff } from "lucide-react";
import { useApplication } from "@/features/applications/api";
import { ApiError } from "@/lib/api-client";
import { Badge, PhaseBadge, TierBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ApplicationDetailPage() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const { data: app, isLoading, error } = useApplication(namespace, name);

  const unavailable = error instanceof ApiError && error.status === 503;

  if (unavailable) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <ServerOff className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No Kubernetes cluster is configured for this control plane.
          </p>
        </CardContent>
      </Card>
    );
  }
  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (error || !app) {
    return (
      <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
        Could not load this application.
      </p>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{app.name}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{app.namespace}</p>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={app.tier} />
          <PhaseBadge phase={app.phase} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Declared intent</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Row label="Image" value={app.image} mono />
          <Row label="Port" value={String(app.port)} />
          <Row label="Desired replicas" value={String(app.desiredReplicas)} />
          <Row label="Exposed" value={app.expose ? "yes" : "no"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Live status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Row label="Phase" value={app.phase || "pending"} />
          <Row label="Ready replicas" value={`${app.readyReplicas}/${app.desiredReplicas}`} />
          <Row label="Observed generation" value={String(app.observedGeneration)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          {app.conditions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No conditions reported yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {app.conditions.map((c) => (
                  <TableRow key={c.type}>
                    <TableCell className="font-medium">{c.type}</TableCell>
                    <TableCell>
                      <Badge tone={c.status === "True" ? "success" : c.status === "False" ? "danger" : "neutral"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.reason ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.message ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
