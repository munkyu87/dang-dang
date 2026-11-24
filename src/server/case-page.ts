import { notFound } from "next/navigation";
import { loadCaseForSession } from "@/server/cases";
import { requireCaseSession } from "@/server/current";
import { processDueJobs } from "@/server/pipeline";
import type { CaseView } from "@/lib/types";

export async function loadOwnedCase(caseId: string, process = false) {
  let session;
  try {
    session = await requireCaseSession(caseId);
  } catch {
    notFound();
  }
  if (process) await processDueJobs();
  const page = loadCaseForSession(session);
  if (page.kind === "missing") notFound();
  return page;
}

export function asView(page: Awaited<ReturnType<typeof loadOwnedCase>>): CaseView | null {
  return page.kind === "ok" ? page.view : null;
}
