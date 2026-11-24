import { setConsent } from "@/server/cases";
import { requireCaseSession } from "@/server/current";
import { asError, assertSameOrigin, jsonOk, readJson } from "@/server/http";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const { id } = await context.params;
    const session = await requireCaseSession(id);
    const body = (await readJson(req)) as { granted?: boolean };
    return jsonOk(setConsent(session, Boolean(body.granted)));
  } catch (error) {
    return asError(error);
  }
}
