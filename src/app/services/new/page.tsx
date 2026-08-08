"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createServiceSchema, CreateServiceValues } from "@/features/catalog/schema";
import { useCreateService } from "@/features/catalog/mutations";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent } from "@/components/ui/card";

export default function NewServicePage() {
  const router = useRouter();
  const create = useCreateService();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateServiceValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: { tenantId: "", name: "", tier: 3, owningTeam: "", onCallRef: "", description: "", repository: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const service = await create.mutateAsync({
        tenantId: values.tenantId,
        name: values.name,
        tier: values.tier,
        owningTeam: values.owningTeam,
        onCallRef: values.onCallRef || undefined,
        description: values.description || undefined,
        repository: values.repository || undefined,
      });
      toast.success(`Service "${service.name}" created`);
      router.push(`/services/${service.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create service");
    }
  });

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">New service</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Tenant ID" error={errors.tenantId?.message}>
              <Input placeholder="uuid of an existing tenant" {...register("tenantId")} />
            </Field>
            <Field label="Name" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Tier" error={errors.tier?.message}>
              <NativeSelect {...register("tier", { valueAsNumber: true })}>
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t}>
                    tier {t}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Owning team" error={errors.owningTeam?.message}>
              <Input {...register("owningTeam")} />
            </Field>
            <Field label="On-call reference" error={errors.onCallRef?.message} hint="Required before promoting to production">
              <Input {...register("onCallRef")} />
            </Field>
            <Field label="Description" error={errors.description?.message}>
              <Input {...register("description")} />
            </Field>
            <Field label="Repository" error={errors.repository?.message}>
              <Input {...register("repository")} />
            </Field>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting || create.isPending}>
                {create.isPending ? "Creating..." : "Create service"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
