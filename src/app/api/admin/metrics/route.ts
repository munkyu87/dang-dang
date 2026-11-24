import { adminOverview } from "@/server/cases";
import { requireAdmin } from "@/server/current";
import { asError, jsonOk } from "@/server/http";

export async function GET() {
  try {
    await requireAdmin();
    return jsonOk(adminOverview());
  } catch (error) {
    return asError(error);
  }
}
