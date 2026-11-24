import { requestJudge } from "@/server/cases";
import { requireCaseSession } from "@/server/current";
import { asError, assertSameOrigin, jsonOk } from "@/server/http";
import { processDueJobs } from "@/server/pipeline";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const { id } = await context.params;
    const session = await requireCaseSession(id);
    const page = requestJudge(session);
    void processDueJobs();
    return jsonOk(page);
  } catch (error) {
    return asError(error);
  }
}
