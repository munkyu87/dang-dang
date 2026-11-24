import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusLive } from "@/components/status-live";
import { asView, loadOwnedCase } from "@/server/case-page";
import { ClosedCase } from "@/components/closed-case";

export const dynamic = "force-dynamic";

export default async function StatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await loadOwnedCase(id, true);
  if (page.kind === "closed") return <ClosedCase caseNumber={page.caseNumber} />;
  const view = asView(page);
  if (!view) return null;
  if (view.question) redirect(`/case/${id}/question`);
  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <p className="text-sm font-black">{view.caseNumber} · {view.title}</p>
      <StatusLive
        caseId={view.id}
        status={view.status}
        persona={view.judge.personaKey}
        mine={view.mySubmitted}
        other={view.otherSubmitted}
        holdReason={view.holdReason}
      />
      {view.mode === "DUAL" && view.role === "A" ? (
        <Link href={`/case/${view.id}/invite`} className="font-black">
          초대 링크 보기
        </Link>
      ) : null}
      {["COMPLETED", "INCONCLUSIVE", "BLOCKED", "FAILED"].includes(view.status) ? (
        <Link href={`/case/${view.id}/verdict`} className="font-black">
          결과 보기
        </Link>
      ) : null}
    </div>
  );
}
