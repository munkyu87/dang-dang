export function ClosedCase({ caseNumber }: { caseNumber: string }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-16">
      <div className="press bg-white p-6">
        <p className="text-sm font-black">{caseNumber}</p>
        <h1 className="mt-2 text-3xl font-black">보관 기간이 끝났습니다</h1>
        <p className="mt-3 font-bold">끝난 사건은 더 이상 열 수 없습니다. 진술 원문도 보여 주지 않습니다.</p>
      </div>
    </section>
  );
}
