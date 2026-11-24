import { redirect } from "next/navigation";
import { QuestionForm } from "@/components/question-form";
import { asView, loadOwnedCase } from "@/server/case-page";

export const dynamic = "force-dynamic";

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await loadOwnedCase(id);
  if (page.kind !== "ok") redirect(`/case/${id}`);
  if (!page.view.question) redirect(`/case/${id}`);
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <QuestionForm
        caseId={page.view.id}
        question={page.view.question.text}
        expiresAt={page.view.question.expiresAt}
        persona={page.view.judge.personaKey}
      />
    </div>
  );
}
