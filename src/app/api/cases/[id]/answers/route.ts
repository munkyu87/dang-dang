import { answerQuestion } from "@/server/cases";
import { requireCaseSession } from "@/server/current";
import { asError, assertSameOrigin, jsonOk, readJson } from "@/server/http";
import { processDueJobs } from "@/server/pipeline";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const { id } = await context.params;
    const session = await requireCaseSession(id);
    const body = (await readJson(req)) as { answer?: string };
    const page = answerQuestion(session, body.answer ?? "");
    void processDueJobs();
    return jsonOk(page);
  } catch (error) {
    return asError(error);
  }
}
