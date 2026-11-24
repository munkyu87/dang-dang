import Link from "next/link";
import { notFound } from "next/navigation";
import { VerdictCard } from "@/components/verdict-card";
import { DEMOS, PERSONA_PREFIX } from "@/content/demos";
import { JUDGES } from "@/lib/judges";

export function generateStaticParams() {
  return DEMOS.map((demo) => ({ slug: demo.slug }));
}

export default async function DemoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ judge?: string }>;
}) {
  const { slug } = await params;
  const { judge: judgeKey } = await searchParams;
  const demo = DEMOS.find((item) => item.slug === slug);
  if (!demo) notFound();
  const judge = JUDGES.find((item) => item.personaKey === judgeKey) ?? JUDGES[0];
  const prefix = PERSONA_PREFIX[judge.personaKey] ?? "";
  return (
    <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <p className="font-black text-hero">가상 체험 · 샘플 · AI 호출 없음</p>
      <div className="flex flex-wrap gap-2">
        {JUDGES.map((item) => (
          <Link
            key={item.id}
            href={`/demo/${demo.slug}?judge=${item.personaKey}`}
            className={`border-2 border-ink px-3 py-2 text-sm font-black ${item.id === judge.id ? "bg-sun" : "bg-white"}`}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <VerdictCard
        caseNumber="DEMO"
        title={demo.title}
        sourceLabel="가상 체험 · 샘플"
        judgeName={judge.name}
        persona={judge.personaKey}
        verdictType={demo.verdictType}
        fault={demo.fault}
        reason={demo.reason}
        order={`${prefix} ${demo.order}`}
        limitations="검수된 예시입니다. 실제 진술이나 판결이 아닙니다."
      />
      <Link href="/new?mode=DUAL" className="font-black">
        함께 재판 시작하기 ↗
      </Link>
    </div>
  );
}
