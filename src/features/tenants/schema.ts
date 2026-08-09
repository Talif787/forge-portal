import { z } from "zod";

export const statusValues = ["active", "suspended", "archived"] as const;
export const planValues = ["free", "standard", "enterprise"] as const;

export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  plan: z.enum(planValues),
  status: z.enum(statusValues),
  maxServices: z.number(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const tenantPageSchema = z.object({
  items: z.array(tenantSchema).nullish().transform((v) => v ?? []),
  nextCursor: z.string().optional(),
});

export type Tenant = z.infer<typeof tenantSchema>;

export const createTenantSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(63)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "Lowercase letters, numbers, and hyphens only"),
  plan: z.enum(planValues),
  maxServices: z.number().int().min(1, "Must allow at least one service").max(1000),
});

export type CreateTenantValues = z.infer<typeof createTenantSchema>;
