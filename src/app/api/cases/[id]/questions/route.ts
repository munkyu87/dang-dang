import { loadCaseForSession } from "@/server/cases";
import { requireCaseSession } from "@/server/current";
import { asError, jsonOk } from "@/server/http";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await requireCaseSession(id);
    const page = loadCaseForSession(session);
    if (page.kind !== "ok") return jsonOk({ question: null });
    return jsonOk({ question: page.view.question });
  } catch (error) {
    return asError(error);
  }
}
