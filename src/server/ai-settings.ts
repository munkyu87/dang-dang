import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { adminAudit, appSettings } from "@/db/schema";
import { AppError } from "@/lib/errors";
import { decryptSecret, encryptSecret } from "@/server/secret";

export type AiProviderName = "mock" | "openai";
export type AiKeySource = "admin" | "env" | "none";

export type AiRuntime = {
  provider: AiProviderName;
  baseUrl: string;
  model: string;
  apiKey: string;
  keySource: AiKeySource;
};

const DEFAULT_BASE = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

function textSetting(key: string) {
  const row = getDb().select().from(appSettings).where(eq(appSettings.key, key)).get();
  return row?.value ?? "";
}

function writeSetting(key: string, value: string) {
  getDb()
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({ target: appSettings.key, set: { value } })
    .run();
}

function deleteSetting(key: string) {
  getDb().delete(appSettings).where(eq(appSettings.key, key)).run();
}

export function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new AppError(400, "VALIDATION", "API 주소 형식이 올바르지 않습니다.");
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) {
    throw new AppError(400, "VALIDATION", "API 주소는 https 여야 합니다.");
  }
  return url.toString().replace(/\/$/, "");
}

function safeBaseUrl(value: string) {
  try {
    return normalizeBaseUrl(value);
  } catch {
    return DEFAULT_BASE;
  }
}

function chosenProvider(stored: string): AiProviderName {
  if (stored === "openai" || stored === "mock") return stored;
  return process.env.AI_PROVIDER === "openai" ? "openai" : "mock";
}

export function readAiRuntime(): AiRuntime {
  const provider = chosenProvider(textSetting("ai_provider"));
  const baseUrl = safeBaseUrl(textSetting("ai_base_url") || process.env.AI_BASE_URL || DEFAULT_BASE);
  const model = (textSetting("ai_model") || process.env.AI_MODEL || DEFAULT_MODEL).trim().slice(0, 80) || DEFAULT_MODEL;
  const encrypted = textSetting("ai_api_key_enc");
  const adminKey = encrypted ? decryptSecret(encrypted) : null;
  if (adminKey) return { provider, baseUrl, model, apiKey: adminKey, keySource: "admin" };
  const envKey = process.env.AI_API_KEY?.trim() || "";
  if (envKey) return { provider, baseUrl, model, apiKey: envKey, keySource: "env" };
  return { provider, baseUrl, model, apiKey: "", keySource: "none" };
}

export function readAiPublic() {
  const runtime = readAiRuntime();
  return {
    provider: runtime.provider,
    baseUrl: runtime.baseUrl,
    model: runtime.model,
    hasApiKey: runtime.keySource !== "none",
    keySource: runtime.keySource,
  };
}

export function saveAiSettings(input: {
  provider: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
  clearApiKey?: boolean;
}) {
  if (input.provider !== "mock" && input.provider !== "openai") {
    throw new AppError(400, "VALIDATION", "AI 공급자를 선택해 주세요.");
  }
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  const model = input.model.trim();
  if (!model || model.length > 80 || /\s/.test(model) || model.startsWith("sk-")) {
    throw new AppError(400, "VALIDATION", "모델 이름이 올바르지 않습니다.");
  }
  const apiKey = input.apiKey?.trim() ?? "";
  if (apiKey && (apiKey.length < 8 || apiKey.length > 300 || /\s/.test(apiKey))) {
    throw new AppError(400, "VALIDATION", "API 키 형식이 올바르지 않습니다.");
  }
  writeSetting("ai_provider", input.provider);
  writeSetting("ai_base_url", baseUrl);
  writeSetting("ai_model", model);
  if (apiKey) writeSetting("ai_api_key_enc", encryptSecret(apiKey));
  else if (input.clearApiKey) deleteSetting("ai_api_key_enc");
  getDb().insert(adminAudit).values({ id: crypto.randomUUID(), action: "setting:ai", createdAt: Date.now() }).run();
}
