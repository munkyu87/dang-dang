import { loadCaseForSession } from "@/server/cases";
import { requireCaseSession } from "@/server/current";
import { asError, jsonOk } from "@/server/http";
import { processDueJobs } from "@/server/pipeline";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireCaseSession(id);
    await processDueJobs();
    return jsonOk(loadCaseForSession(session));
  } catch (error) {
    return asError(error);
  }
}
