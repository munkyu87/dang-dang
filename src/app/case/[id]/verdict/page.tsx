import { VerdictActions } from "@/components/verdict-actions";
import { VerdictCard } from "@/components/verdict-card";
import { SAFETY_HELP } from "@/lib/constants";
import { sourceLabel } from "@/lib/utils";
import { asView, loadOwnedCase } from "@/server/case-page";
import { ClosedCase } from "@/components/closed-case";

export const dynamic = "force-dynamic";

export default async function VerdictPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await loadOwnedCase(id, true);
  if (page.kind === "closed") return <ClosedCase caseNumber={page.caseNumber} />;
  const view = asView(page);
  if (!view) return null;
  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      {view.status === "BLOCKED" || !view.verdict ? (
        <section className="press bg-white p-6">
          <h1 className="text-3xl font-black">{view.status === "FAILED" ? "판결을 마치지 못했습니다" : "이번 내용은 판결하지 않습니다"}</h1>
          <p className="mt-3 leading-relaxed font-bold">{view.status === "FAILED" ? "잠시 뒤 다시 시도할 수 있습니다." : SAFETY_HELP}</p>
        </section>
      ) : (
        <VerdictCard
          caseNumber={view.caseNumber}
          title={view.mode === "SOLO" ? view.title : view.verdict.title}
          sourceLabel={sourceLabel(view.mode, view.verdict.statementSources)}
          judgeName={view.judge.name}
          persona={view.judge.personaKey}
          verdictType={view.verdict.verdictType}
          fault={view.verdict.fault}
          reason={view.verdict.reason}
          order={view.verdict.order}
          limitations={view.verdict.limitations}
        />
      )}
      {view.verdict?.claims ? (
        <section className="press bg-white p-5">
          <h2 className="font-black">주장 요약</h2>
          <p className="mt-2">A · {view.verdict.claims.A}</p>
          <p className="mt-1">B · {view.verdict.claims.B}</p>
          <p className="mt-3 text-sm font-bold">원문이 아니라 요약입니다.</p>
        </section>
      ) : null}
      <VerdictActions view={view} />
    </div>
  );
}
