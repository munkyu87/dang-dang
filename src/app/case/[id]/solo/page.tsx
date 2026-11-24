import { redirect } from "next/navigation";
import { StatementForm } from "@/components/statement-form";
import { asView, loadOwnedCase } from "@/server/case-page";

export const dynamic = "force-dynamic";

export default async function SoloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await loadOwnedCase(id);
  if (page.kind === "closed") redirect(`/case/${id}`);
  const view = asView(page);
  if (!view) redirect("/");
  if (view.mode !== "SOLO") redirect(`/case/${id}/statement`);
  if (view.mySubmitted) redirect(`/case/${id}`);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm font-black">{view.caseNumber} · 혼자 재판</p>
      <h1 className="mb-2 text-4xl font-black">{view.title}</h1>
      <p className="mb-4 font-bold">B 초대는 없습니다. 상대 칸은 내가 전하는 말이며, 상대의 확인을 받은 진술이 아닙니다.</p>
      <StatementForm caseId={view.id} solo />
    </div>
  );
}
