"use client";

import Link from "next/link";
import { Activity, Boxes, Building2, Server } from "lucide-react";
import { useServices } from "@/features/catalog/api";
import { useTenants } from "@/features/tenants/api";
import { useApplications } from "@/features/applications/api";
import { useHealth } from "@/features/health/api";
import { ApiError } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const services = useServices();
  const tenants = useTenants();
  const applications = useApplications();
  const health = useHealth();

  const appsUnavailable = applications.error instanceof ApiError && applications.error.status === 503;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Control-plane overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          title="Control plane"
          icon={<Activity className="h-4 w-4" />}
          loading={health.isLoading}
          value={health.data ? (health.data.ok ? "Ready" : "Degraded") : "Unknown"}
          valueClass={health.data?.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}
        />
        <Metric
          title="Services"
          icon={<Boxes className="h-4 w-4" />}
          loading={services.isLoading}
          value={services.data?.items.length ?? 0}
          href="/services"
        />
        <Metric
          title="Tenants"
          icon={<Building2 className="h-4 w-4" />}
          loading={tenants.isLoading}
          value={tenants.data?.items.length ?? 0}
          href="/tenants"
        />
        <Metric
          title="Applications"
          icon={<Server className="h-4 w-4" />}
          loading={applications.isLoading && !appsUnavailable}
          value={appsUnavailable ? "n/a" : applications.data?.items.length ?? 0}
          href="/applications"
        />
      </div>

      {(services.isError || tenants.isError) && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
          Could not reach the control plane. Confirm the backend is running on the configured URL.
        </p>
      )}
    </div>
  );
}

function Metric({
  title,
  icon,
  value,
  loading,
  href,
  valueClass,
}: {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  loading: boolean;
  href?: string;
  valueClass?: string;
}) {
  const card = (
    <Card className={href ? "transition-shadow hover:shadow-md" : undefined}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-8 w-16" /> : <p className={`text-3xl font-semibold ${valueClass ?? ""}`}>{value}</p>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}
