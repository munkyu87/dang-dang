import { NewCaseForm } from "@/components/new-case-form";
import { JUDGES } from "@/lib/judges";
import type { Mode } from "@/lib/types";

export default async function NewCasePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode: raw } = await searchParams;
  const mode: Mode | null = raw === "SOLO" ? "SOLO" : raw === "DUAL" ? "DUAL" : null;
  if (!mode) {
    return (
      <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
        <h1 className="text-4xl font-black">어떤 재판인가요?</h1>
        <a className="press bg-party-b p-5 text-2xl font-black" href="/new?mode=DUAL">
          함께 재판
        </a>
        <a className="press bg-party-a p-5 text-2xl font-black" href="/new?mode=SOLO">
          혼자 재판
        </a>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm font-black text-hero">{mode === "DUAL" ? "함께 재판" : "혼자 재판"}</p>
      <h1 className="mb-4 text-4xl font-black">사건 등록</h1>
      <NewCaseForm
        mode={mode}
        judges={JUDGES.map((judge) => ({
          id: judge.id,
          name: judge.name,
          personaKey: judge.personaKey,
          summary: judge.summary,
        }))}
      />
    </div>
  );
}
