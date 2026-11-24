import { cookies } from "next/headers";
import { AppError } from "@/lib/errors";
import { isProduction } from "@/lib/config";
import { readAdmin, readSession, signAdmin, signSession, type SessionPayload } from "@/server/session-token";

export const SESSION_COOKIE = "dd_session";
export const ADMIN_COOKIE = "dd_admin";
export const CLIENT_COOKIE = "dd_cid";

export function cookieBase(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
    maxAge,
  };
}

export async function cookieJar() {
  return cookies();
}

export async function currentSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return readSession(raw);
}

export async function requireCaseSession(caseId: string) {
  const session = await currentSession();
  if (!session || session.caseId !== caseId) {
    throw new AppError(404, "NOT_FOUND", "사건을 찾을 수 없습니다.");
  }
  return session;
}

export async function requireAdmin() {
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw || !readAdmin(raw)) throw new AppError(401, "UNAUTHORIZED", "관리자 인증이 필요합니다.");
}

export async function ensureClientId() {
  const jar = await cookies();
  const existing = jar.get(CLIENT_COOKIE)?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  jar.set(CLIENT_COOKIE, id, cookieBase(60 * 60 * 24 * 365));
  return id;
}

export async function setSessionCookie(payload: SessionPayload) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(payload), cookieBase(Math.max(60, Math.floor((payload.exp - Date.now()) / 1000))));
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, signAdmin(), cookieBase(60 * 60 * 12));
}
