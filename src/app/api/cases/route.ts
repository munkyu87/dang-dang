import { createCase } from "@/server/cases";
import { clientLimitKey, asError, assertSameOrigin, jsonOk, readJson } from "@/server/http";
import { ensureClientId, setSessionCookie } from "@/server/current";
import { getDb } from "@/db";
import { cases } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = (await readJson(req)) as {
      mode?: "DUAL" | "SOLO";
      title?: string;
      category?: string;
      summary?: string;
      judgeId?: string;
    };
    const clientId = await ensureClientId();
    const created = createCase({
      mode: body.mode ?? "DUAL",
      title: body.title ?? "",
      category: body.category ?? "",
      summary: body.summary,
      judgeId: body.judgeId ?? "",
      limitKey: clientLimitKey(req, clientId),
    });
    const row = getDb().select().from(cases).where(eq(cases.id, created.caseId)).get();
    await setSessionCookie({ caseId: created.caseId, role: "A", exp: row?.expiresAt ?? created.expiresAt });
    return jsonOk({ caseId: created.caseId, caseNumber: created.caseNumber, aToken: created.aToken, bToken: created.bToken });
  } catch (error) {
    return asError(error);
  }
}
