import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resetDbForTests } from "@/db";

export async function withDb<T>(fn: () => Promise<T> | T) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ddang-"));
  const previous = {
    DATABASE_PATH: process.env.DATABASE_PATH,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AI_PROVIDER: process.env.AI_PROVIDER,
  };
  process.env.DATABASE_PATH = path.join(dir, "app.sqlite");
  process.env.AUTH_SECRET = "test-secret";
  process.env.AI_PROVIDER = "mock";
  resetDbForTests();
  try {
    return await fn();
  } finally {
    resetDbForTests();
    process.env.DATABASE_PATH = previous.DATABASE_PATH;
    process.env.AUTH_SECRET = previous.AUTH_SECRET;
    process.env.AI_PROVIDER = previous.AI_PROVIDER;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
