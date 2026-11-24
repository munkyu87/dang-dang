import { redirect } from "next/navigation";
import { ClosedCase } from "@/components/closed-case";
import { asView, loadOwnedCase } from "@/server/case-page";

export const dynamic = "force-dynamic";

export default async function CaseEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await loadOwnedCase(id, true);
  if (page.kind === "closed") return <ClosedCase caseNumber={page.caseNumber} />;
  const view = asView(page);
  if (!view) redirect("/");
  if (view.question) redirect(`/case/${id}/question`);
  if (["COMPLETED", "INCONCLUSIVE", "BLOCKED", "FAILED"].includes(view.status)) redirect(`/case/${id}/verdict`);
  if (!view.mySubmitted) redirect(view.mode === "SOLO" ? `/case/${id}/solo` : `/case/${id}/statement`);
  redirect(`/case/${id}/status`);
}
