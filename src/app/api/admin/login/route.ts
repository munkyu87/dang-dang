import { AppError } from "@/lib/errors";
import { adminOverview } from "@/server/cases";
import { requireAdmin, setAdminCookie } from "@/server/current";
import { asError, assertSameOrigin, jsonOk, readJson } from "@/server/http";
import { safeEqual } from "@/server/tokens";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const body = (await readJson(req)) as { password?: string };
    const expected = process.env.ADMIN_PASSWORD || "";
    if (!expected || !body.password || !safeEqual(body.password, expected)) {
      throw new AppError(401, "UNAUTHORIZED", "관리자 인증에 실패했습니다.");
    }
    await setAdminCookie();
    return jsonOk({ ok: true });
  } catch (error) {
    return asError(error);
  }
}

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(adminOverview());
  } catch (error) {
    return asError(error);
  }
}
