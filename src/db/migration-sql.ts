export const MIGRATION_SQL = `
CREATE TABLE IF NOT EXISTS judges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  persona_key TEXT NOT NULL UNIQUE,
  prompt_version TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL,
  judge_id TEXT NOT NULL,
  status TEXT NOT NULL,
  trial_no INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  deleted_at INTEGER
);
CREATE TABLE IF NOT EXISTS case_tokens (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  role TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  claimed_at INTEGER,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER
);
CREATE TABLE IF NOT EXISTS statements (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  party TEXT NOT NULL,
  trial_no INTEGER NOT NULL,
  body TEXT NOT NULL,
  reported_other_body TEXT,
  submitted_at INTEGER NOT NULL,
  UNIQUE (case_id, party, trial_no)
);
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  party TEXT NOT NULL,
  trial_no INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  expires_at INTEGER NOT NULL,
  answered_at INTEGER,
  UNIQUE (case_id, party, trial_no)
);
CREATE TABLE IF NOT EXISTS verdicts (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  trial_no INTEGER NOT NULL,
  type TEXT NOT NULL,
  fault_a INTEGER,
  fault_b INTEGER,
  result_json TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE (case_id, trial_no)
);
CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  party TEXT NOT NULL,
  scope TEXT NOT NULL,
  granted_at INTEGER,
  revoked_at INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  UNIQUE (case_id, party, scope)
);
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  case_id TEXT,
  stage TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_krw INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key_hash TEXT NOT NULL,
  window_key TEXT NOT NULL,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (key_hash, window_key)
);
CREATE TABLE IF NOT EXISTS judgment_jobs (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  trial_no INTEGER NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER,
  last_error_code TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (case_id, trial_no, stage)
);
CREATE TABLE IF NOT EXISTS admin_audit (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_tokens_case ON case_tokens(case_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON judgment_jobs(status);
`;
