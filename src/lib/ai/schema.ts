import { z } from "zod";

export const classifySchema = z.object({
  decision: z.enum(["PROCEED", "QUESTION", "BLOCK"]),
  questions: z
    .array(
      z.object({
        party: z.enum(["A", "B"]),
        text: z.string().min(1).max(200),
      }),
    )
    .max(2),
  reasonCode: z.string().max(40).nullable(),
});

export const verdictSchema = z
  .object({
    mode: z.enum(["DUAL", "SOLO"]),
    statementSources: z.object({
      A: z.enum(["DIRECT", "REPORTED", "NONE"]),
      B: z.enum(["DIRECT", "REPORTED", "NONE"]),
    }),
    verdictType: z.enum(["FAULT_RATIO", "NO_FAULT", "INCONCLUSIVE", "BLOCKED"]),
    title: z.string().min(1).max(80),
    issues: z.array(z.string().min(1).max(80)).max(5),
    claims: z.object({
      A: z.string().max(300),
      B: z.string().max(300),
    }),
    agreedFacts: z.array(z.string().max(200)).max(6),
    disputedFacts: z.array(z.string().max(200)).max(6),
    fault: z
      .object({
        A: z.number().int().min(0).max(100),
        B: z.number().int().min(0).max(100),
      })
      .nullable(),
    reason: z.string().min(1).max(800),
    limitations: z.string().min(1).max(400),
    order: z.string().min(1).max(200),
    blockedReason: z.string().max(80).nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.verdictType === "FAULT_RATIO") {
      if (!value.fault || value.fault.A + value.fault.B !== 100) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "비율 합계는 100이어야 합니다.", path: ["fault"] });
      }
    } else if (value.fault !== null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "이 판결에는 비율이 없습니다.", path: ["fault"] });
    }
  });

export type ClassifyResult = z.infer<typeof classifySchema>;
export type VerdictDraft = z.infer<typeof verdictSchema>;

export type AiUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costKrw: number;
};

export type AiResult<T> = { data: T; usage: AiUsage };
