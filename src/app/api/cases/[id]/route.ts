import { deleteCase } from "@/server/cases";
import { requireCaseSession } from "@/server/current";
import { asError, assertSameOrigin, jsonOk } from "@/server/http";

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const { id } = await context.params;
    const session = await requireCaseSession(id);
    deleteCase(session);
    return jsonOk({ deleted: true });
  } catch (error) {
    return asError(error);
  }
}
