import { z } from "zod";

export const conditionSchema = z.object({
  type: z.string(),
  status: z.string(),
  reason: z.string().optional(),
  message: z.string().optional(),
  observedGeneration: z.number().optional(),
});

export const applicationSchema = z.object({
  namespace: z.string(),
  name: z.string(),
  image: z.string(),
  port: z.number(),
  desiredReplicas: z.number(),
  tier: z.number(),
  expose: z.boolean(),
  phase: z.string(),
  readyReplicas: z.number(),
  observedGeneration: z.number(),
  conditions: z
    .array(conditionSchema)
    .nullish()
    .transform((v) => v ?? []),
});

export const applicationPageSchema = z.object({
  items: z
    .array(applicationSchema)
    .nullish()
    .transform((v) => v ?? []),
});

export type Application = z.infer<typeof applicationSchema>;
export type Condition = z.infer<typeof conditionSchema>;
