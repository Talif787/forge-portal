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
