import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { MIGRATION_SQL } from "@/db/migration-sql";
import { PROMPT_VERSION } from "@/lib/constants";
import { JUDGES } from "@/lib/judges";

export type AppDatabase = BetterSQLite3Database<typeof schema>;

let state: { path: string; sqlite: Database.Database; db: AppDatabase } | null = null;

export function resetDbForTests() {
  if (state) {
    state.sqlite.close();
    state = null;
  }
}

function seed(db: AppDatabase) {
  const existing = db.select().from(schema.judges).all();
  if (existing.length === 0) {
    for (const judge of JUDGES) {
      db.insert(schema.judges)
        .values({
          id: judge.id,
          name: judge.name,
          personaKey: judge.personaKey,
          promptVersion: PROMPT_VERSION,
          enabled: 1,
        })
        .run();
    }
  }
  const defaults: Record<string, string> = {
    daily_budget_krw: process.env.AI_DAILY_BUDGET_KRW || "10000",
    daily_case_limit: process.env.DAILY_CASE_LIMIT || "5",
  };
  for (const [key, value] of Object.entries(defaults)) {
    const row = db.select().from(schema.appSettings).where(eq(schema.appSettings.key, key)).get();
    if (!row) db.insert(schema.appSettings).values({ key, value }).run();
  }
}

export function getDb() {
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "dangdang.sqlite");
  if (state?.path === file) return state.db;
  if (state) state.sqlite.close();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.exec(MIGRATION_SQL);
  const db = drizzle(sqlite, { schema });
  seed(db);
  state = { path: file, sqlite, db };
  return db;
}

export function getSetting(db: AppDatabase, key: string, fallback: number) {
  const row = db.select().from(schema.appSettings).where(eq(schema.appSettings.key, key)).get();
  if (!row) return fallback;
  const value = Number(row.value);
  return Number.isFinite(value) ? value : fallback;
}
