import { saveAdminSetting } from "@/server/cases";
import { requireAdmin } from "@/server/current";
import { asError, assertSameOrigin, jsonOk, readJson } from "@/server/http";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const body = (await readJson(req)) as { dailyBudgetKrw?: number; dailyCaseLimit?: number };
    if (body.dailyBudgetKrw !== undefined) saveAdminSetting("daily_budget_krw", Number(body.dailyBudgetKrw));
    if (body.dailyCaseLimit !== undefined) saveAdminSetting("daily_case_limit", Number(body.dailyCaseLimit));
    return jsonOk({ ok: true });
  } catch (error) {
    return asError(error);
  }
}
