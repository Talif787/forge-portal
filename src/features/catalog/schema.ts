import { z } from "zod";

export const lifecycleValues = ["experimental", "production", "deprecated", "retired"] as const;

export const ownershipSchema = z.object({
  owningTeam: z.string(),
  onCallRef: z.string().optional(),
});

export const serviceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  tier: z.number(),
  lifecycle: z.enum(lifecycleValues),
  repository: z.string().optional(),
  ownership: ownershipSchema,
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const servicePageSchema = z.object({
  items: z.array(serviceSchema).nullish().transform((v) => v ?? []),
  nextCursor: z.string().optional(),
});

export type Service = z.infer<typeof serviceSchema>;
export type Lifecycle = (typeof lifecycleValues)[number];

export const createServiceSchema = z.object({
  tenantId: z.string().min(1, "Tenant ID is required"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  tier: z.number().int().min(1).max(4),
  owningTeam: z.string().min(1, "Owning team is required"),
  onCallRef: z.string().optional(),
  description: z.string().optional(),
  repository: z.string().optional(),
});

export type CreateServiceValues = z.infer<typeof createServiceSchema>;
