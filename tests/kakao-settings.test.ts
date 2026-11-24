import { describe, expect, it } from "vitest";
import { getDb } from "@/db";
import { adminAudit, appSettings } from "@/db/schema";
import { readKakaoKey, saveKakaoKey } from "@/server/kakao-settings";
import { withDb } from "./helpers";

describe("kakao settings", () => {
  it("JavaScript 키를 저장하고 기록에는 키를 남기지 않는다", async () => {
    await withDb(async () => {
      saveKakaoKey({ javascriptKey: "a1b2c3d4e5f67890" });
      expect(readKakaoKey()).toEqual({ javascriptKey: "a1b2c3d4e5f67890", source: "admin" });
      const audits = getDb().select().from(adminAudit).all().map((row) => row.action);
      expect(audits).toContain("setting:kakao");
      expect(JSON.stringify(audits)).not.toContain("a1b2c3d4e5f67890");
      saveKakaoKey({ clear: true });
      process.env.KAKAO_JAVASCRIPT_KEY = "envkey12345678";
      try {
        expect(readKakaoKey().source).toBe("env");
      } finally {
        delete process.env.KAKAO_JAVASCRIPT_KEY;
      }
      expect(getDb().select().from(appSettings).all().some((row) => row.key === "kakao_javascript_key")).toBe(false);
    });
  });
});