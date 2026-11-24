import { JudgeArt, Stamp } from "@/components/judge-art";

export function VerdictCard({
  caseNumber,
  title,
  sourceLabel,
  judgeName,
  persona,
  verdictType,
  fault,
  reason,
  order,
  limitations,
}: {
  caseNumber: string;
  title: string | null;
  sourceLabel: string;
  judgeName: string;
  persona: string;
  verdictType: string;
  fault: { A: number; B: number } | null;
  reason: string;
  order: string;
  limitations: string;
}) {
  return (
    <article className="press bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black">CASE / {caseNumber}</p>
          <p className="mt-1 text-sm font-black text-hero">{sourceLabel}</p>
          <h1 className="mt-2 text-3xl font-black">{title ?? "혼자 재판"}</h1>
          <p className="mt-1 font-bold">{judgeName}</p>
        </div>
        <JudgeArt persona={persona} expression="verdict" className="h-24 w-24" />
      </div>
      {verdictType === "FAULT_RATIO" && fault ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Ratio label="A 책임" value={fault.A} className="bg-party-a" />
          <Ratio label="B 책임" value={fault.B} className="bg-party-b" />
        </div>
      ) : (
        <p className="press mt-6 bg-sun p-4 text-xl font-black">
          {verdictType === "NO_FAULT" ? "쌍방 책임 없음" : "판단 보류"}
        </p>
      )}
      <section className="mt-5">
        <h2 className="font-black">판결 이유</h2>
        <p className="mt-1 leading-relaxed">{reason}</p>
      </section>
      <section className="press mt-5 bg-hero p-4 text-white">
        <h2 className="font-black text-sun">오늘의 주문</h2>
        <p className="mt-1 text-2xl font-black">{order}</p>
      </section>
      <p className="mt-4 text-sm font-bold">{limitations}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-sm font-black">가상 예시 · 법적 효력 없음</p>
        <Stamp />
      </div>
    </article>
  );
}

function Ratio({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={`border-2 border-ink p-3 ${className}`}>
      <p className="text-sm font-black">{label}</p>
      <p className="text-4xl font-black">{value}%</p>
      <div className="mt-2 h-3 border-2 border-ink bg-white">
        <div className="h-full bg-ink" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
