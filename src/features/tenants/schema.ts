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
