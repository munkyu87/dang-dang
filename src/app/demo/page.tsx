import Link from "next/link";
import { DEMOS } from "@/content/demos";

export default function DemoListPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <p className="text-sm font-black text-hero">AI 호출 없음</p>
      <h1 className="text-4xl font-black">체험 재판</h1>
      <p className="mt-2 font-bold">고정된 가상 사건입니다. 실제 사건도, 외부 AI 호출도 없습니다.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {DEMOS.map((demo) => (
          <Link key={demo.slug} href={`/demo/${demo.slug}`} className="press block bg-white p-5">
            <p className="text-xs font-black">{demo.category}</p>
            <h2 className="mt-2 text-2xl font-black">{demo.title}</h2>
            <p className="mt-2">{demo.summary}</p>
            <p className="mt-6 font-black">샘플 결과 보기 ↗</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
