import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function requestId() {
  return crypto.randomUUID();
}

export function jsonOk(data: unknown, init?: { status?: number; requestId?: string }) {
  const id = init?.requestId ?? requestId();
  return NextResponse.json({ data, error: null, requestId: id }, { status: init?.status ?? 200, headers: { "x-request-id": id } });
}

export function jsonError(status: number, code: string, message: string, id = requestId()) {
  return NextResponse.json(
    { data: null, error: { code, message }, requestId: id },
    { status, headers: { "x-request-id": id } },
  );
}

export function asError(error: unknown, id = requestId()) {
  if (error instanceof AppError) return jsonError(error.status, error.code, error.message, id);
  console.error(`request ${id} failed`);
  return jsonError(500, "INTERNAL", "처리 중 문제가 생겼습니다.", id);
}

export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("host");
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AppError(403, "FORBIDDEN", "요청을 확인할 수 없습니다.");
  }
  if (!host || originHost !== host) throw new AppError(403, "FORBIDDEN", "요청을 확인할 수 없습니다.");
}

export async function readJson(req: Request) {
  try {
    return await req.json();
  } catch {
    throw new AppError(400, "VALIDATION", "요청 본문을 읽을 수 없습니다.");
  }
}

export function clientLimitKey(req: Request, clientId: string) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = process.env.TRUST_PROXY === "1" && forwarded ? forwarded.split(",")[0].trim() : "direct";
  return `${ip}|${clientId}`;
}
