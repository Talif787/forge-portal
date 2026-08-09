import { z } from "zod";

export const workflowSchema = z.object({
  workflowId: z.string(),
  runId: z.string(),
  type: z.string(),
  status: z.string(),
  startTime: z.string().optional().default(""),
  closeTime: z.string().optional().default(""),
  historyLength: z.number(),
});

export const workflowPageSchema = z.object({
  items: z
    .array(workflowSchema)
    .nullish()
    .transform((v) => v ?? []),
});

export type Workflow = z.infer<typeof workflowSchema>;
