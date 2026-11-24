import { saveAiSettings } from "@/server/ai-settings";
import { saveAdminSetting } from "@/server/cases";
import { requireAdmin } from "@/server/current";
import { asError, assertSameOrigin, jsonOk, readJson } from "@/server/http";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await requireAdmin();
    const body = (await readJson(req)) as {
      dailyBudgetKrw?: number;
      dailyCaseLimit?: number;
      provider?: string;
      baseUrl?: string;
      model?: string;
      apiKey?: string;
      clearApiKey?: boolean;
    };
    if (body.dailyBudgetKrw !== undefined) saveAdminSetting("daily_budget_krw", Number(body.dailyBudgetKrw));
    if (body.dailyCaseLimit !== undefined) saveAdminSetting("daily_case_limit", Number(body.dailyCaseLimit));
    if (body.provider && body.baseUrl && body.model) {
      saveAiSettings({
        provider: body.provider,
        baseUrl: body.baseUrl,
        model: body.model,
        apiKey: body.apiKey,
        clearApiKey: body.clearApiKey,
      });
    }
    return jsonOk({ ok: true });
  } catch (error) {
    return asError(error);
  }
}
