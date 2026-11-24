import { issueShareToken } from "@/server/cases";
import { requireCaseSession } from "@/server/current";
import { asError, assertSameOrigin, jsonOk } from "@/server/http";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const { id } = await context.params;
    const session = await requireCaseSession(id);
    const issued = issueShareToken(session);
    return jsonOk({ token: issued.token });
  } catch (error) {
    return asError(error);
  }
}
