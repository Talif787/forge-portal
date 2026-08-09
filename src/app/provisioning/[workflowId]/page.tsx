"use client";

import { useParams } from "next/navigation";
import { ServerOff } from "lucide-react";
import { useWorkflow } from "@/features/provisioning/api";
import { ApiError } from "@/lib/api-client";
import { WorkflowStatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkflowDetailPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const id = decodeURIComponent(workflowId);
  const { data: wf, isLoading, error } = useWorkflow(id);

  const unavailable = error instanceof ApiError && error.status === 503;

  if (unavailable) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <ServerOff className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Temporal is not reachable from this control plane.</p>
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
  if (error || !wf) {
    return (
      <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
        Could not load this workflow.
      </p>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{wf.workflowId}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{wf.type}</p>
        </div>
        <WorkflowStatusBadge status={wf.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Execution</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Row label="Run ID" value={wf.runId} mono />
          <Row label="Status" value={wf.status} />
          <Row label="Started" value={wf.startTime ? new Date(wf.startTime).toLocaleString() : "-"} />
          <Row label="Closed" value={wf.closeTime ? new Date(wf.closeTime).toLocaleString() : "-"} />
          <Row label="History events" value={String(wf.historyLength)} />
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
