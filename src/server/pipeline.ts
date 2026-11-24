import { and, eq, isNull, lt, or } from "drizzle-orm";
import { getDb, getSetting, type AppDatabase } from "@/db";
import { aiUsageLogs, cases, judgmentJobs, judges, questions, statements, verdicts } from "@/db/schema";
import { applyPersona } from "@/lib/ai/persona";
import { getProvider } from "@/lib/ai/provider";
import { readAiRuntime } from "@/server/ai-settings";
import { classifySchema, verdictSchema, type AiUsage, type ClassifyResult } from "@/lib/ai/schema";
import { PROMPT_VERSION, SAFETY_HELP } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { detectBlock } from "@/lib/safety";
import type { Mode } from "@/lib/types";
import { kstDayStart } from "@/lib/utils";

export { SAFETY_HELP };

export function expireDue(db = getDb()) {
  const now = Date.now();
  db.update(cases)
    .set({ status: "EXPIRED", updatedAt: now })
    .where(and(lt(cases.expiresAt, now), isNull(cases.deletedAt)))
    .run();
}

export function enqueueJob(db: AppDatabase, caseId: string, trialNo: number, stage: string) {
  const now = Date.now();
  db.insert(judgmentJobs)
    .values({
      id: crypto.randomUUID(),
      caseId,
      trialNo,
      stage,
      status: "pending",
      attempts: 0,
      leaseUntil: null,
      lastErrorCode: null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: [judgmentJobs.caseId, judgmentJobs.trialNo, judgmentJobs.stage] })
    .run();
}

export function sweepQuestions(db: AppDatabase, caseId: string) {
  const row = db.select().from(cases).where(eq(cases.id, caseId)).get();
  if (!row || row.status !== "QUESTIONING") return;
  const pending = db
    .select()
    .from(questions)
    .where(and(eq(questions.caseId, caseId), eq(questions.trialNo, row.trialNo)))
    .all();
  const now = Date.now();
  const waiting = pending.some((item) => !item.answer && item.expiresAt > now);
  if (waiting) return;
  enqueueJob(db, row.id, row.trialNo, "judge");
  db.update(cases).set({ status: "READY", updatedAt: now }).where(eq(cases.id, row.id)).run();
}

function hasBudget(db: AppDatabase) {
  const spent = db
    .select()
    .from(aiUsageLogs)
    .all()
    .filter((row) => row.createdAt >= kstDayStart() && row.status !== "failed")
    .reduce((sum, row) => sum + row.costKrw, 0);
  const inflight = db
    .select()
    .from(judgmentJobs)
    .all()
    .filter((row) => row.status === "pending" || row.status === "leased").length;
  const budget = getSetting(db, "daily_budget_krw", 10000);
  return spent + Math.max(0, inflight - 1) * 5 + 5 <= budget;
}

function logUsage(db: AppDatabase, caseId: string, stage: string, usage: AiUsage, latencyMs: number, status: string) {
  db.insert(aiUsageLogs)
    .values({
      id: crypto.randomUUID(),
      requestId: crypto.randomUUID(),
      caseId,
      stage,
      model: usage.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costKrw: status === "failed" ? 0 : usage.costKrw,
      status,
      latencyMs,
      createdAt: Date.now(),
    })
    .run();
}

function finishJob(db: AppDatabase, id: string) {
  db.update(judgmentJobs)
    .set({ status: "done", leaseUntil: null, updatedAt: Date.now() })
    .where(eq(judgmentJobs.id, id))
    .run();
}

function sanitizeQuestions(mode: Mode, questionsIn: ClassifyResult["questions"]) {
  const seen = new Set<string>();
  const output: { party: "A" | "B"; text: string }[] = [];
  for (const item of questionsIn) {
    if (mode === "SOLO" && item.party !== "A") continue;
    if (seen.has(item.party)) continue;
    const text = item.text.trim().slice(0, 200);
    if (!text) continue;
    seen.add(item.party);
    output.push({ party: item.party, text });
  }
  return output.slice(0, mode === "SOLO" ? 1 : 2);
}

function storeBlocked(db: AppDatabase, caseId: string, trialNo: number, code: string, model: string) {
  const existing = db.select().from(verdicts).where(and(eq(verdicts.caseId, caseId), eq(verdicts.trialNo, trialNo))).get();
  if (!existing) {
    db.insert(verdicts)
      .values({
        id: crypto.randomUUID(),
        caseId,
        trialNo,
        type: "BLOCKED",
        faultA: null,
        faultB: null,
        resultJson: JSON.stringify({ blockedReason: code }),
        model,
        promptVersion: PROMPT_VERSION,
        createdAt: Date.now(),
      })
      .run();
  }
  db.update(cases).set({ status: "BLOCKED", updatedAt: Date.now() }).where(eq(cases.id, caseId)).run();
}

async function runClaimedJob(db: AppDatabase, job: typeof judgmentJobs.$inferSelect) {
  const row = db.select().from(cases).where(eq(cases.id, job.caseId)).get();
  if (!row || row.deletedAt) {
    finishJob(db, job.id);
    return;
  }
  if (row.expiresAt < Date.now()) {
    db.update(cases).set({ status: "EXPIRED", updatedAt: Date.now() }).where(eq(cases.id, row.id)).run();
    finishJob(db, job.id);
    return;
  }
  const existingVerdict = db
    .select()
    .from(verdicts)
    .where(and(eq(verdicts.caseId, row.id), eq(verdicts.trialNo, row.trialNo)))
    .get();
  if (existingVerdict) {
    finishJob(db, job.id);
    return;
  }
  if (!hasBudget(db)) {
    db.update(judgmentJobs)
      .set({
        status: "pending",
        leaseUntil: null,
        attempts: Math.max(0, job.attempts - 1),
        lastErrorCode: "BUDGET",
        updatedAt: Date.now(),
      })
      .where(eq(judgmentJobs.id, job.id))
      .run();
    db.update(cases).set({ status: "READY", updatedAt: Date.now() }).where(eq(cases.id, row.id)).run();
    return;
  }

  db.update(cases).set({ status: "JUDGING", updatedAt: Date.now() }).where(eq(cases.id, row.id)).run();
  const stmtRows = db
    .select()
    .from(statements)
    .where(and(eq(statements.caseId, row.id), eq(statements.trialNo, row.trialNo)))
    .all();
  const questionRows = db
    .select()
    .from(questions)
    .where(and(eq(questions.caseId, row.id), eq(questions.trialNo, row.trialNo)))
    .all();
  const judge = db.select().from(judges).where(eq(judges.id, row.judgeId)).get();
  if (!judge) throw new AppError(500, "INTERNAL", "판사 정보를 찾지 못했습니다.");
  const sideA = stmtRows.find((item) => item.party === "A");
  const sideB = stmtRows.find((item) => item.party === "B");
  const blob = [sideA?.body, sideA?.reportedOtherBody, sideB?.body, ...questionRows.map((item) => item.answer ?? "")].join("\n");
  const localBlock = detectBlock(blob);
  if (localBlock) {
    storeBlocked(db, row.id, row.trialNo, localBlock, "local-screen");
    finishJob(db, job.id);
    return;
  }

  const provider = getProvider(readAiRuntime());
  const input = {
    mode: row.mode as Mode,
    title: row.title,
    category: row.category,
    personaKey: judge.personaKey,
    alreadyAsked: questionRows.length > 0,
    answers: questionRows.map((item) => item.answer ?? "").filter(Boolean),
    statements: {
      A: sideA ? { body: sideA.body, reportedOther: sideA.reportedOtherBody } : undefined,
      B: sideB ? { body: sideB.body } : undefined,
    },
  };

  if (job.stage === "classify" && questionRows.length === 0) {
    const started = Date.now();
    const classified = await provider.classify(input);
    logUsage(db, row.id, "classify", classified.usage, Date.now() - started, "ok");
    const parsed = classifySchema.parse(classified.data);
    if (parsed.decision === "BLOCK") {
      storeBlocked(db, row.id, row.trialNo, parsed.reasonCode || "BLOCKED", classified.usage.model);
      finishJob(db, job.id);
      return;
    }
    const ask = sanitizeQuestions(row.mode as Mode, parsed.decision === "QUESTION" ? parsed.questions : []);
    if (ask.length > 0) {
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
      for (const item of ask) {
        db.insert(questions)
          .values({
            id: crypto.randomUUID(),
            caseId: row.id,
            party: item.party,
            trialNo: row.trialNo,
            question: item.text,
            answer: null,
            expiresAt,
            answeredAt: null,
          })
          .run();
      }
      db.update(cases).set({ status: "QUESTIONING", updatedAt: Date.now() }).where(eq(cases.id, row.id)).run();
      finishJob(db, job.id);
      return;
    }
  }

  const started = Date.now();
  const judged = await provider.judge(input);
  logUsage(db, row.id, "judge", judged.usage, Date.now() - started, "ok");
  const parsed = verdictSchema.parse(judged.data);
  const styled = verdictSchema.parse(applyPersona(parsed, judge.personaKey));
  const createdAt = Date.now();
  const { blockedReason: _blocked, ...rest } = styled;
  const publicVerdict = {
    ...rest,
    blockedReason: null,
    judgeName: judge.name,
    judgePersona: judge.personaKey,
    caseNumber: row.caseNumber,
    createdAt,
  };
  db.insert(verdicts)
    .values({
      id: crypto.randomUUID(),
      caseId: row.id,
      trialNo: row.trialNo,
      type: styled.verdictType,
      faultA: styled.fault?.A ?? null,
      faultB: styled.fault?.B ?? null,
      resultJson: JSON.stringify(publicVerdict),
      model: judged.usage.model,
      promptVersion: PROMPT_VERSION,
      createdAt,
    })
    .run();
  const status = styled.verdictType === "INCONCLUSIVE" ? "INCONCLUSIVE" : styled.verdictType === "BLOCKED" ? "BLOCKED" : "COMPLETED";
  db.update(cases)
    .set({ status, updatedAt: createdAt, expiresAt: createdAt + 30 * 24 * 60 * 60 * 1000 })
    .where(eq(cases.id, row.id))
    .run();
  finishJob(db, job.id);
}

export async function processDueJobs(limit = 3) {
  const db = getDb();
  expireDue(db);
  const openCases = db.select().from(cases).all();
  for (const row of openCases) {
    if (row.status === "QUESTIONING") sweepQuestions(db, row.id);
  }
  const now = Date.now();
  const candidates = db
    .select()
    .from(judgmentJobs)
    .where(or(eq(judgmentJobs.status, "pending"), and(eq(judgmentJobs.status, "leased"), lt(judgmentJobs.leaseUntil, now))))
    .limit(limit)
    .all();
  for (const job of candidates) {
    const claimed = db
      .update(judgmentJobs)
      .set({ status: "leased", leaseUntil: now + 30_000, attempts: job.attempts + 1, updatedAt: now })
      .where(
        and(
          eq(judgmentJobs.id, job.id),
          or(eq(judgmentJobs.status, "pending"), and(eq(judgmentJobs.status, "leased"), lt(judgmentJobs.leaseUntil, now))),
        ),
      )
      .run();
    if (claimed.changes !== 1) continue;
    try {
      await runClaimedJob(db, { ...job, attempts: job.attempts + 1 });
    } catch (error) {
      const attempts = job.attempts + 1;
      const code = error instanceof AppError ? error.code : "AI_FAILED";
      console.error(`job ${job.id} ${code}`);
      if (attempts >= 3) {
        db.update(judgmentJobs)
          .set({ status: "failed", leaseUntil: null, lastErrorCode: code, updatedAt: Date.now() })
          .where(eq(judgmentJobs.id, job.id))
          .run();
        db.update(cases).set({ status: "FAILED", updatedAt: Date.now() }).where(eq(cases.id, job.caseId)).run();
      } else {
        db.update(judgmentJobs)
          .set({ status: "pending", leaseUntil: null, lastErrorCode: code, updatedAt: Date.now() })
          .where(eq(judgmentJobs.id, job.id))
          .run();
      }
    }
  }
}

export function retryFailedJob(db: AppDatabase, caseId: string) {
  const job = db
    .select()
    .from(judgmentJobs)
    .all()
    .filter((item) => item.caseId === caseId && item.status === "failed")
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];
  if (!job || job.attempts >= 3) throw new AppError(409, "CONFLICT", "다시 시도할 수 없는 판결입니다.");
  db.update(judgmentJobs)
    .set({ status: "pending", leaseUntil: null, lastErrorCode: null, updatedAt: Date.now() })
    .where(eq(judgmentJobs.id, job.id))
    .run();
  db.update(cases).set({ status: "READY", updatedAt: Date.now() }).where(eq(cases.id, caseId)).run();
}
