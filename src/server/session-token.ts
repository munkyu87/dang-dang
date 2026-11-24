import { createHmac, timingSafeEqual } from "node:crypto";
import { getAuthSecret } from "@/lib/config";
import type { Role } from "@/lib/types";

export type SessionPayload = { caseId: string; role: Role; exp: number };
export type AdminPayload = { role: "admin"; exp: number };

function sign(body: string) {
  return createHmac("sha256", getAuthSecret()).update(body).digest("base64url");
}

function verify(token: string) {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as unknown;
  } catch {
    return null;
  }
}

export function signSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readSession(token: string): SessionPayload | null {
  const parsed = verify(token) as SessionPayload | null;
  if (!parsed || parsed.role !== "A" && parsed.role !== "B") return null;
  if (!parsed.caseId || parsed.exp < Date.now()) return null;
  return parsed;
}

export function signAdmin(exp = Date.now() + 12 * 60 * 60 * 1000) {
  const body = Buffer.from(JSON.stringify({ role: "admin", exp })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readAdmin(token: string): AdminPayload | null {
  const parsed = verify(token) as AdminPayload | null;
  if (!parsed || parsed.role !== "admin" || parsed.exp < Date.now()) return null;
  return parsed;
}
