import { getShareByToken } from "@/server/cases";
import { asError, jsonOk } from "@/server/http";

export async function GET(_req: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    return jsonOk(getShareByToken(token));
  } catch (error) {
    return asError(error);
  }
}
