import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getAuthSecret } from "@/lib/config";

export function newToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashLimitKey(raw: string) {
  return createHmac("sha256", getAuthSecret()).update(raw).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function makeCaseNumber(timestamp = Date.now()) {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(timestamp))
    .replaceAll("-", "");
  return `DD-${day}-${randomBytes(2).toString("hex").toUpperCase()}`;
}
