import { AppError } from "@/lib/errors";
import { claimToken } from "@/server/cases";
import { asError, assertSameOrigin, jsonOk, readJson } from "@/server/http";
import { setSessionCookie } from "@/server/current";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = (await readJson(req)) as { token?: string };
    if (!body.token) throw new AppError(400, "VALIDATION", "참여 링크가 없습니다.");
    const claimed = claimToken(body.token);
    await setSessionCookie({ caseId: claimed.caseId, role: claimed.role, exp: claimed.expiresAt });
    return jsonOk({ caseId: claimed.caseId, role: claimed.role });
  } catch (error) {
    return asError(error);
  }
}
