import { and, eq } from "drizzle-orm";
import { getDb, getSetting, type AppDatabase } from "@/db";
import {
  adminAudit,
  aiUsageLogs,
  appSettings,
  caseTokens,
  cases,
  consents,
  judges,
  judgmentJobs,
  questions,
  rateLimits,
  statements,
  verdicts,
} from "@/db/schema";
import { CATEGORIES, DAY_MS, LIMITS, type Category } from "@/lib/constants";
import { AppError } from "@/lib/errors";
import { verdictSchema } from "@/lib/ai/schema";
import type { CasePage, CaseView, InvitePreview, Mode, PublicVerdict, Role, ShareView } from "@/lib/types";
import { kstDay } from "@/lib/utils";
import { enqueueJob, expireDue, retryFailedJob, sweepQuestions } from "@/server/pipeline";
import { hashLimitKey, hashToken, makeCaseNumber, newToken } from "@/server/tokens";

type Session = { caseId: string; role: Role };

export function listJudges() {
  return getDb().select().from(judges).where(eq(judges.enabled, 1)).all();
}

function takeLimit(db: AppDatabase, limitKey: string) {
  const keyHash = hashLimitKey(limitKey);
  const windowKey = kstDay();
  const limit = getSetting(db, "daily_case_limit", 5);
  const row = db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.keyHash, keyHash), eq(rateLimits.windowKey, windowKey)))
    .get();
  if (row && row.count >= limit) {
    throw new AppError(429, "RATE_LIMIT", "오늘은 더 이상 사건을 만들 수 없습니다.");
  }
  if (row) {
    db.update(rateLimits)
      .set({ count: row.count + 1 })
      .where(and(eq(rateLimits.keyHash, keyHash), eq(rateLimits.windowKey, windowKey)))
      .run();
  } else {
    db.insert(rateLimits)
      .values({ keyHash, windowKey, count: 1, expiresAt: Date.now() + DAY_MS })
      .run();
  }
}

export function createCase(input: {
  mode: Mode;
  title: string;
  category: string;
  summary?: string;
  judgeId: string;
  limitKey: string;
}) {
  const db = getDb();
  expireDue(db);
  const title = input.title.trim();
  if (!title || title.length > LIMITS.title) throw new AppError(400, "VALIDATION", "사건명은 1~50자입니다.");
  if (!CATEGORIES.includes(input.category as Category)) throw new AppError(400, "VALIDATION", "카테고리를 선택해 주세요.");
  const summary = input.summary?.trim() || null;
  if (summary && summary.length > LIMITS.summary) throw new AppError(400, "VALIDATION", "설명은 300자까지입니다.");
  if (input.mode !== "DUAL" && input.mode !== "SOLO") throw new AppError(400, "VALIDATION", "재판 방식을 선택해 주세요.");
  const judge = db.select().from(judges).where(and(eq(judges.id, input.judgeId), eq(judges.enabled, 1))).get();
  if (!judge) throw new AppError(400, "VALIDATION", "판사를 선택해 주세요.");

  const now = Date.now();
  const id = crypto.randomUUID();
  const caseNumber = makeCaseNumber(now);
  const expiresAt = now + 7 * DAY_MS;
  const aToken = newToken();
  const bToken = input.mode === "DUAL" ? newToken() : null;
  takeLimit(db, input.limitKey);
  db.transaction((tx) => {
    tx.insert(cases)
      .values({
        id,
        caseNumber,
        mode: input.mode,
        title,
        summary,
        category: input.category,
        judgeId: judge.id,
        status: "WAITING",
        trialNo: 1,
        createdAt: now,
        updatedAt: now,
        expiresAt,
        deletedAt: null,
      })
      .run();
    tx.insert(caseTokens)
      .values({
        id: crypto.randomUUID(),
        caseId: id,
        role: "A",
        tokenHash: hashToken(aToken),
        createdAt: now,
        claimedAt: null,
        expiresAt,
        revokedAt: null,
      })
      .run();
    if (bToken) {
      tx.insert(caseTokens)
        .values({
          id: crypto.randomUUID(),
          caseId: id,
          role: "B",
          tokenHash: hashToken(bToken),
          createdAt: now,
          claimedAt: null,
          expiresAt,
          revokedAt: null,
        })
        .run();
    }
  });
  return { caseId: id, caseNumber, aToken, bToken, expiresAt };
}

function tokenRow(raw: string) {
  const row = getDb().select().from(caseTokens).where(eq(caseTokens.tokenHash, hashToken(raw))).get();
  if (!row || row.revokedAt || row.expiresAt < Date.now()) return null;
  return row;
}

export function peekInvite(raw: string): InvitePreview {
  expireDue();
  const token = tokenRow(raw);
  if (!token || (token.role !== "A" && token.role !== "B")) {
    throw new AppError(404, "NOT_FOUND", "링크를 찾을 수 없습니다.");
  }
  const row = getDb().select().from(cases).where(eq(cases.id, token.caseId)).get();
  if (!row || row.deletedAt || row.status === "DELETED" || row.status === "EXPIRED") {
    throw new AppError(404, "NOT_FOUND", "사건을 찾을 수 없습니다.");
  }
  const judge = getDb().select().from(judges).where(eq(judges.id, row.judgeId)).get();
  return {
    caseId: row.id,
    caseNumber: row.caseNumber,
    title: row.title,
    category: row.category,
    mode: row.mode as Mode,
    role: token.role,
    judgeName: judge?.name ?? "판사",
  };
}

export function claimToken(raw: string) {
  const preview = peekInvite(raw);
  const token = tokenRow(raw);
  if (!token) throw new AppError(404, "NOT_FOUND", "링크를 찾을 수 없습니다.");
  if (!token.claimedAt) {
    getDb().update(caseTokens).set({ claimedAt: Date.now() }).where(eq(caseTokens.id, token.id)).run();
  }
  const row = getDb().select().from(cases).where(eq(cases.id, preview.caseId)).get();
  return { caseId: preview.caseId, role: preview.role, expiresAt: row?.expiresAt ?? Date.now() + DAY_MS };
}

function caseRow(caseId: string) {
  return getDb().select().from(cases).where(eq(cases.id, caseId)).get();
}

function publicVerdict(
  raw: string | undefined,
  status: string,
  meta: { judgeName: string; judgePersona: string; caseNumber: string; createdAt: number },
): PublicVerdict | null {
  if (!raw || status === "BLOCKED") return null;
  const parsed = verdictSchema.safeParse(JSON.parse(raw));
  if (!parsed.success || parsed.data.verdictType === "BLOCKED") return null;
  const { blockedReason: _blocked, ...rest } = parsed.data;
  return { ...rest, ...meta };
}

export function loadCaseForSession(session: Session): CasePage {
  const db = getDb();
  expireDue(db);
  const row = caseRow(session.caseId);
  if (!row || row.deletedAt || row.status === "DELETED") return { kind: "missing" };
  if (row.status === "EXPIRED") return { kind: "closed", caseNumber: row.caseNumber };
  const judge = db.select().from(judges).where(eq(judges.id, row.judgeId)).get();
  if (!judge) return { kind: "missing" };
  const stmtRows = db
    .select()
    .from(statements)
    .where(and(eq(statements.caseId, row.id), eq(statements.trialNo, row.trialNo)))
    .all();
  const mine = stmtRows.find((item) => item.party === session.role) ?? null;
  const other = stmtRows.find((item) => item.party !== session.role) ?? null;
  const question = db
    .select()
    .from(questions)
    .where(and(eq(questions.caseId, row.id), eq(questions.party, session.role), eq(questions.trialNo, row.trialNo)))
    .get();
  const verdict = db.select().from(verdicts).where(and(eq(verdicts.caseId, row.id), eq(verdicts.trialNo, row.trialNo))).get();
  const consentRows = db.select().from(consents).where(and(eq(consents.caseId, row.id), eq(consents.scope, "share"))).all();
  const mineConsent = consentRows.find((item) => item.party === session.role);
  const otherParty = session.role === "A" ? "B" : "A";
  const otherConsent = consentRows.find((item) => item.party === otherParty);
  const granted = (item?: { grantedAt: number | null; revokedAt: number | null }) =>
    Boolean(item?.grantedAt && !item.revokedAt);
  const shareReady = row.mode === "SOLO" ? session.role === "A" && granted(mineConsent) : granted(mineConsent) && granted(otherConsent);
  const jobs = db.select().from(judgmentJobs).where(eq(judgmentJobs.caseId, row.id)).all();
  const hold = jobs.find((item) => item.lastErrorCode === "BUDGET" && item.status === "pending");
  const failed = jobs.find((item) => item.status === "failed");
  const view: CaseView = {
    id: row.id,
    caseNumber: row.caseNumber,
    mode: row.mode as Mode,
    title: row.title,
    summary: row.summary,
    category: row.category,
    judge: { id: judge.id, name: judge.name, personaKey: judge.personaKey },
    status: row.status,
    trialNo: row.trialNo,
    role: session.role,
    mine: mine ? { body: mine.body, reportedOther: mine.reportedOtherBody } : null,
    mySubmitted: Boolean(mine),
    otherSubmitted: row.mode === "DUAL" ? Boolean(other) : null,
    question: question && !question.answer ? { text: question.question, expiresAt: question.expiresAt } : null,
    verdict: publicVerdict(verdict?.resultJson, row.status, {
      judgeName: judge.name,
      judgePersona: judge.personaKey,
      caseNumber: row.caseNumber,
      createdAt: verdict?.createdAt ?? row.updatedAt,
    }),
    consents: {
      mine: granted(mineConsent),
      other: row.mode === "DUAL" ? granted(otherConsent) : null,
      shareReady,
    },
    expiresAt: row.expiresAt,
    holdReason: hold ? "BUDGET" : row.status === "FAILED" ? failed?.lastErrorCode ?? "FAILED" : null,
  };
  return { kind: "ok", view };
}

function requireOpen(session: Session) {
  const page = loadCaseForSession(session);
  if (page.kind !== "ok") throw new AppError(page.kind === "closed" ? 410 : 404, page.kind === "closed" ? "EXPIRED" : "NOT_FOUND", page.kind === "closed" ? "보관 기간이 끝났습니다." : "사건을 찾을 수 없습니다.");
  return page.view;
}

export function submitStatement(session: Session, input: { body: string; reportedOther?: string }) {
  const db = getDb();
  const view = requireOpen(session);
  if (!["WAITING", "READY"].includes(view.status)) {
    throw new AppError(409, "CONFLICT", "지금은 진술을 제출할 수 없습니다.");
  }
  const body = input.body.trim();
  if (!body || body.length > LIMITS.statement) throw new AppError(400, "VALIDATION", "진술은 1~2000자입니다.");
  let reported: string | null = null;
  if (view.mode === "SOLO") {
    if (session.role !== "A") throw new AppError(403, "FORBIDDEN", "혼자 재판은 작성자만 제출할 수 있습니다.");
    const extra = input.reportedOther?.trim() ?? "";
    if (extra) {
      if (extra.length > LIMITS.statement) throw new AppError(400, "VALIDATION", "상대 주장은 2000자까지입니다.");
      reported = extra;
    }
  } else if (input.reportedOther?.trim()) {
    throw new AppError(400, "VALIDATION", "함께 재판에서는 상대 진술을 대신 적을 수 없습니다.");
  }
  if (view.mySubmitted) throw new AppError(409, "CONFLICT", "진술은 한 번만 제출할 수 있습니다.");
  const now = Date.now();
  db.insert(statements)
    .values({
      id: crypto.randomUUID(),
      caseId: view.id,
      party: session.role,
      trialNo: view.trialNo,
      body,
      reportedOtherBody: reported,
      submittedAt: now,
    })
    .run();
  const ready = view.mode === "SOLO" || view.otherSubmitted;
  if (ready) {
    db.update(cases).set({ status: "READY", updatedAt: now }).where(eq(cases.id, view.id)).run();
    enqueueJob(db, view.id, view.trialNo, "classify");
  }
  return loadCaseForSession(session);
}

export function answerQuestion(session: Session, text: string) {
  const db = getDb();
  const view = requireOpen(session);
  if (view.status !== "QUESTIONING" || !view.question) {
    throw new AppError(409, "CONFLICT", "답변할 질문이 없습니다.");
  }
  const answer = text.trim();
  if (!answer || answer.length > LIMITS.answer) throw new AppError(400, "VALIDATION", "답변은 1~500자입니다.");
  const now = Date.now();
  if (view.question.expiresAt < now) throw new AppError(409, "CONFLICT", "답변 기한이 지났습니다.");
  db.update(questions)
    .set({ answer, answeredAt: now })
    .where(and(eq(questions.caseId, view.id), eq(questions.party, session.role), eq(questions.trialNo, view.trialNo)))
    .run();
  sweepQuestions(db, view.id);
  return loadCaseForSession(session);
}

export function requestJudge(session: Session) {
  const db = getDb();
  const view = requireOpen(session);
  if (view.status === "FAILED") {
    retryFailedJob(db, view.id);
    return loadCaseForSession(session);
  }
  if (view.status === "READY") {
    enqueueJob(db, view.id, view.trialNo, view.question ? "judge" : "classify");
    return loadCaseForSession(session);
  }
  throw new AppError(409, "CONFLICT", "지금은 판결을 시작할 수 없습니다.");
}

export function setConsent(session: Session, granted: boolean) {
  const db = getDb();
  const view = requireOpen(session);
  if (!["COMPLETED", "INCONCLUSIVE"].includes(view.status)) {
    throw new AppError(409, "CONFLICT", "공유 동의는 판결 이후에 할 수 있습니다.");
  }
  if (view.mode === "SOLO" && session.role !== "A") throw new AppError(403, "FORBIDDEN", "혼자 재판은 작성자만 공유할 수 있습니다.");
  const now = Date.now();
  const existing = db
    .select()
    .from(consents)
    .where(and(eq(consents.caseId, view.id), eq(consents.party, session.role), eq(consents.scope, "share")))
    .get();
  if (existing) {
    db.update(consents)
      .set(granted ? { grantedAt: now, revokedAt: null, version: existing.version + 1 } : { revokedAt: now, version: existing.version + 1 })
      .where(eq(consents.id, existing.id))
      .run();
  } else {
    db.insert(consents)
      .values({
        id: crypto.randomUUID(),
        caseId: view.id,
        party: session.role,
        scope: "share",
        grantedAt: granted ? now : null,
        revokedAt: granted ? null : now,
        version: 1,
      })
      .run();
  }
  if (!granted) {
    db.update(caseTokens)
      .set({ revokedAt: now })
      .where(and(eq(caseTokens.caseId, view.id), eq(caseTokens.role, "SHARE")))
      .run();
  }
  return loadCaseForSession(session);
}

export function issueShareToken(session: Session) {
  const page = loadCaseForSession(session);
  if (page.kind !== "ok" || !page.view.consents.shareReady) {
    throw new AppError(409, "CONFLICT", "공유에는 필요한 동의가 아직 없습니다.");
  }
  const db = getDb();
  const now = Date.now();
  db.update(caseTokens)
    .set({ revokedAt: now })
    .where(and(eq(caseTokens.caseId, page.view.id), eq(caseTokens.role, "SHARE")))
    .run();
  const token = newToken();
  db.insert(caseTokens)
    .values({
      id: crypto.randomUUID(),
      caseId: page.view.id,
      role: "SHARE",
      tokenHash: hashToken(token),
      createdAt: now,
      claimedAt: null,
      expiresAt: page.view.expiresAt,
      revokedAt: null,
    })
    .run();
  return { token, view: page.view };
}

export function rotateInvite(session: Session) {
  const view = requireOpen(session);
  if (view.mode !== "DUAL" || session.role !== "A") {
    throw new AppError(403, "FORBIDDEN", "초대 링크는 사건을 만든 사람만 다시 만들 수 있습니다.");
  }
  if (view.otherSubmitted) throw new AppError(409, "CONFLICT", "상대가 이미 진술을 제출했습니다.");
  const db = getDb();
  const now = Date.now();
  db.update(caseTokens)
    .set({ revokedAt: now })
    .where(and(eq(caseTokens.caseId, view.id), eq(caseTokens.role, "B")))
    .run();
  const token = newToken();
  db.insert(caseTokens)
    .values({
      id: crypto.randomUUID(),
      caseId: view.id,
      role: "B",
      tokenHash: hashToken(token),
      createdAt: now,
      claimedAt: null,
      expiresAt: view.expiresAt,
      revokedAt: null,
    })
    .run();
  return { token };
}

export function getShareByToken(raw: string): ShareView {
  expireDue();
  const token = tokenRow(raw);
  if (!token || token.role !== "SHARE") throw new AppError(404, "NOT_FOUND", "공유 링크를 찾을 수 없습니다.");
  const row = caseRow(token.caseId);
  if (!row || row.deletedAt || !["COMPLETED", "INCONCLUSIVE"].includes(row.status)) {
    throw new AppError(404, "NOT_FOUND", "공유 링크를 찾을 수 없습니다.");
  }
  const verdict = getDb().select().from(verdicts).where(and(eq(verdicts.caseId, row.id), eq(verdicts.trialNo, row.trialNo))).get();
  const judgeRow = getDb().select().from(judges).where(eq(judges.id, row.judgeId)).get();
  const parsed = verdict
    ? publicVerdict(verdict.resultJson, row.status, {
        judgeName: judgeRow?.name ?? "판사",
        judgePersona: judgeRow?.personaKey ?? "principle",
        caseNumber: row.caseNumber,
        createdAt: verdict.createdAt,
      })
    : null;
  if (!parsed) throw new AppError(404, "NOT_FOUND", "공유 링크를 찾을 수 없습니다.");
  return {
    caseNumber: row.caseNumber,
    mode: row.mode as Mode,
    category: row.category,
    title: row.mode === "SOLO" ? null : row.title,
    sourceLabel: row.mode === "SOLO" ? "단독 진술 · 상대 미확인" : "양측 직접 진술",
    judgeName: parsed.judgeName,
    judgePersona: parsed.judgePersona,
    verdictType: parsed.verdictType,
    fault: parsed.fault,
    reason: parsed.reason,
    order: parsed.order,
    limitations: parsed.limitations,
  };
}

export function deleteCase(session: Session) {
  const view = requireOpen(session);
  const now = Date.now();
  const db = getDb();
  db.update(cases).set({ status: "DELETED", deletedAt: now, updatedAt: now }).where(eq(cases.id, view.id)).run();
  db.update(caseTokens).set({ revokedAt: now }).where(eq(caseTokens.caseId, view.id)).run();
}

export function adminOverview() {
  const db = getDb();
  expireDue(db);
  const rows = db.select().from(cases).all();
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
  const usage = db.select().from(aiUsageLogs).all();
  const today = usage.filter((row) => row.createdAt >= Date.now() - DAY_MS);
  const costToday = today.filter((row) => row.status !== "failed").reduce((sum, row) => sum + row.costKrw, 0);
  const failedJobs = db.select().from(judgmentJobs).all().filter((row) => row.status === "failed").length;
  return {
    counts,
    costToday,
    callsToday: today.length,
    failedJobs,
    budget: getSetting(db, "daily_budget_krw", 10000),
    caseLimit: getSetting(db, "daily_case_limit", 5),
  };
}

export function saveAdminSetting(key: "daily_budget_krw" | "daily_case_limit", value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000) {
    throw new AppError(400, "VALIDATION", "설정값이 올바르지 않습니다.");
  }
  const db = getDb();
  const next = String(Math.floor(value));
  db.insert(appSettings)
    .values({ key, value: next })
    .onConflictDoUpdate({ target: appSettings.key, set: { value: next } })
    .run();
  db.insert(adminAudit).values({ id: crypto.randomUUID(), action: `setting:${key}`, createdAt: Date.now() }).run();
}
