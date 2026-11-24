import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminAudit, appSettings } from "@/db/schema";
import { AppError } from "@/lib/errors";

export type KakaoKeySource = "admin" | "env" | "none";

function textSetting(key: string) {
  const row = getDb().select().from(appSettings).where(eq(appSettings.key, key)).get();
  return row?.value?.trim() ?? "";
}

export function readKakaoKey() {
  const stored = textSetting("kakao_javascript_key");
  if (stored) return { javascriptKey: stored, source: "admin" as const };
  const envKey = process.env.KAKAO_JAVASCRIPT_KEY?.trim() || "";
  if (envKey) return { javascriptKey: envKey, source: "env" as const };
  return { javascriptKey: "", source: "none" as const };
}

export function saveKakaoKey(input: { javascriptKey?: string; clear?: boolean }) {
  const key = input.javascriptKey?.trim() ?? "";
  if (key && !/^[A-Za-z0-9]{8,80}$/.test(key)) {
    throw new AppError(400, "VALIDATION", "카카오 JavaScript 키 형식이 올바르지 않습니다.");
  }
  if (key) {
    getDb()
      .insert(appSettings)
      .values({ key: "kakao_javascript_key", value: key })
      .onConflictDoUpdate({ target: appSettings.key, set: { value: key } })
      .run();
  } else if (input.clear) {
    getDb().delete(appSettings).where(eq(appSettings.key, "kakao_javascript_key")).run();
  }
  getDb().insert(adminAudit).values({ id: crypto.randomUUID(), action: "setting:kakao", createdAt: Date.now() }).run();
}
