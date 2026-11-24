import { integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const judges = sqliteTable("judges", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  personaKey: text("persona_key").notNull().unique(),
  promptVersion: text("prompt_version").notNull(),
  enabled: integer("enabled").notNull().default(1),
});

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const cases = sqliteTable("cases", {
  id: text("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  mode: text("mode").notNull(),
  title: text("title").notNull(),
  summary: text("summary"),
  category: text("category").notNull(),
  judgeId: text("judge_id").notNull(),
  status: text("status").notNull(),
  trialNo: integer("trial_no").notNull().default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  expiresAt: integer("expires_at").notNull(),
  deletedAt: integer("deleted_at"),
});

export const caseTokens = sqliteTable("case_tokens", {
  id: text("id").primaryKey(),
  caseId: text("case_id").notNull(),
  role: text("role").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  createdAt: integer("created_at").notNull(),
  claimedAt: integer("claimed_at"),
  expiresAt: integer("expires_at").notNull(),
  revokedAt: integer("revoked_at"),
});

export const statements = sqliteTable(
  "statements",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull(),
    party: text("party").notNull(),
    trialNo: integer("trial_no").notNull(),
    body: text("body").notNull(),
    reportedOtherBody: text("reported_other_body"),
    submittedAt: integer("submitted_at").notNull(),
  },
  (table) => ({
    uniq: uniqueIndex("statements_case_party_trial").on(table.caseId, table.party, table.trialNo),
  }),
);

export const questions = sqliteTable(
  "questions",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull(),
    party: text("party").notNull(),
    trialNo: integer("trial_no").notNull(),
    question: text("question").notNull(),
    answer: text("answer"),
    expiresAt: integer("expires_at").notNull(),
    answeredAt: integer("answered_at"),
  },
  (table) => ({
    uniq: uniqueIndex("questions_case_party_trial").on(table.caseId, table.party, table.trialNo),
  }),
);

export const verdicts = sqliteTable(
  "verdicts",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull(),
    trialNo: integer("trial_no").notNull(),
    type: text("type").notNull(),
    faultA: integer("fault_a"),
    faultB: integer("fault_b"),
    resultJson: text("result_json").notNull(),
    model: text("model").notNull(),
    promptVersion: text("prompt_version").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    uniq: uniqueIndex("verdicts_case_trial").on(table.caseId, table.trialNo),
  }),
);

export const consents = sqliteTable(
  "consents",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull(),
    party: text("party").notNull(),
    scope: text("scope").notNull(),
    grantedAt: integer("granted_at"),
    revokedAt: integer("revoked_at"),
    version: integer("version").notNull().default(1),
  },
  (table) => ({
    uniq: uniqueIndex("consents_case_party_scope").on(table.caseId, table.party, table.scope),
  }),
);

export const aiUsageLogs = sqliteTable("ai_usage_logs", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull().unique(),
  caseId: text("case_id"),
  stage: text("stage").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costKrw: integer("cost_krw").notNull().default(0),
  status: text("status").notNull(),
  latencyMs: integer("latency_ms").notNull().default(0),
  createdAt: integer("created_at").notNull(),
});

export const rateLimits = sqliteTable(
  "rate_limits",
  {
    keyHash: text("key_hash").notNull(),
    windowKey: text("window_key").notNull(),
    count: integer("count").notNull(),
    expiresAt: integer("expires_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.keyHash, table.windowKey] }),
  }),
);

export const judgmentJobs = sqliteTable(
  "judgment_jobs",
  {
    id: text("id").primaryKey(),
    caseId: text("case_id").notNull(),
    trialNo: integer("trial_no").notNull(),
    stage: text("stage").notNull(),
    status: text("status").notNull(),
    attempts: integer("attempts").notNull().default(0),
    leaseUntil: integer("lease_until"),
    lastErrorCode: text("last_error_code"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    uniq: uniqueIndex("jobs_case_trial_stage").on(table.caseId, table.trialNo, table.stage),
  }),
);

export const adminAudit = sqliteTable("admin_audit", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  createdAt: integer("created_at").notNull(),
});
