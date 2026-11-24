import { redirect } from "next/navigation";
import { StatementForm } from "@/components/statement-form";
import { asView, loadOwnedCase } from "@/server/case-page";

export const dynamic = "force-dynamic";

export default async function StatementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await loadOwnedCase(id);
  if (page.kind === "closed") redirect(`/case/${id}`);
  const view = asView(page);
  if (!view) redirect("/");
  if (view.mode === "SOLO") redirect(`/case/${id}/solo`);
  if (view.mySubmitted) redirect(`/case/${id}`);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm font-black">{view.caseNumber} · {view.role === "A" ? "A의 입장" : "B의 입장"}</p>
      <h1 className="mb-4 text-4xl font-black">{view.title}</h1>
      <StatementForm caseId={view.id} solo={false} />
    </div>
  );
}
