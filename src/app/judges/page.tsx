import { JudgeArt } from "@/components/judge-art";
import { JUDGES } from "@/lib/judges";

export default function JudgesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <h1 className="text-4xl font-black">오늘의 판사</h1>
      <p className="mt-2 text-lg font-bold">판단 기준은 동일하고, 말투만 달라요.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {JUDGES.map((judge) => (
          <article key={judge.id} className="press flex gap-4 bg-white p-4">
            <JudgeArt persona={judge.personaKey} className="h-28 w-28 shrink-0" />
            <div>
              <h2 className="text-xl font-black">{judge.name}</h2>
              <p className="font-bold">{judge.summary}</p>
              <p className="mt-2">“{judge.line}”</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
