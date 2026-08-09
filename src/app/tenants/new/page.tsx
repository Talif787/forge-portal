"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTenantSchema, CreateTenantValues, planValues } from "@/features/tenants/schema";
import { useCreateTenant } from "@/features/tenants/mutations";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent } from "@/components/ui/card";

export default function NewTenantPage() {
  const router = useRouter();
  const create = useCreateTenant();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTenantValues>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { name: "", slug: "", plan: "standard", maxServices: 10 },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const tenant = await create.mutateAsync(values);
      toast.success(`Tenant "${tenant.name}" created`);
      router.push(`/tenants/${tenant.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create tenant");
    }
  });

  return (
    <div className="max-w-xl space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold tracking-tight">New tenant</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Name" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Slug" error={errors.slug?.message} hint="Lowercase letters, numbers, and hyphens (a DNS label)">
              <Input placeholder="acme-corp" {...register("slug")} />
            </Field>
            <Field label="Plan" error={errors.plan?.message}>
              <NativeSelect {...register("plan")}>
                {planValues.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Max services" error={errors.maxServices?.message}>
              <Input type="number" {...register("maxServices", { valueAsNumber: true })} />
            </Field>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting || create.isPending}>
                {create.isPending ? "Creating..." : "Create tenant"}
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
