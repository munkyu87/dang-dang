import { describe, expect, it } from "vitest";
import { getDb } from "@/db";
import { adminAudit, appSettings } from "@/db/schema";
import { readAiPublic, readAiRuntime, saveAiSettings } from "@/server/ai-settings";
import { withDb } from "./helpers";

const secret = "sk-test-secret-value";

describe("ai settings", () => {
  it("키는 암호화해서 저장하고 화면용 정보에는 넣지 않는다", async () => {
    await withDb(async () => {
      saveAiSettings({
        provider: "openai",
        baseUrl: "https://api.openai.com/v1/",
        model: "gpt-4o-mini",
        apiKey: secret,
      });
      const stored = JSON.stringify(getDb().select().from(appSettings).all());
      expect(stored).not.toContain(secret);
      expect(readAiRuntime().apiKey).toBe(secret);
      expect(readAiRuntime().provider).toBe("openai");
      const pub = readAiPublic();
      expect(pub).toEqual({
        provider: "openai",
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-4o-mini",
        hasApiKey: true,
        keySource: "admin",
      });
      expect(JSON.stringify(pub)).not.toContain(secret);
      const audits = getDb().select().from(adminAudit).all().map((row) => row.action);
      expect(audits).toContain("setting:ai");
      expect(JSON.stringify(audits)).not.toContain(secret);

      saveAiSettings({
        provider: "openai",
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-4o-mini",
        apiKey: "",
      });
      expect(readAiRuntime().apiKey).toBe(secret);

      saveAiSettings({
        provider: "mock",
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-4o-mini",
        clearApiKey: true,
      });
      process.env.AI_API_KEY = "sk-env-fallback-key";
      try {
        expect(readAiRuntime().keySource).toBe("env");
        expect(readAiRuntime().apiKey).toBe("sk-env-fallback-key");
        expect(readAiRuntime().provider).toBe("mock");
      } finally {
        delete process.env.AI_API_KEY;
      }
    });
  });
});
