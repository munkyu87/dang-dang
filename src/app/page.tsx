import Link from "next/link";
import { JudgeArt } from "@/components/judge-art";
import { Button } from "@/components/ui/button";

const modes = [
  {
    href: "/new?mode=DUAL",
    kicker: "01 / DUAL",
    title: "함께 재판",
    body: "상대방 초대 · 각자 진술",
    action: "친구 초대",
    className: "bg-party-b",
  },
  {
    href: "/new?mode=SOLO",
    kicker: "02 / SOLO",
    title: "혼자 재판",
    body: "내 사연으로 바로 판결",
    action: "사건 접수",
    className: "bg-party-a",
  },
  {
    href: "/demo",
    kicker: "03 / DEMO",
    title: "체험 재판",
    body: "가상 사건 · AI 호출 없음",
    action: "예시 보기",
    className: "bg-white",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
      <section className="press overflow-hidden bg-hero text-white">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_220px] lg:items-center">
          <div>
            <p className="inline-block border-2 border-white px-2 py-1 text-xs font-black">AI 일상 재판소</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
              그래서, 누가
              <br />더 잘못했는데?!
            </h1>
            <p className="mt-4 text-lg font-bold">내 말도, 네 말도. AI가 들어봅니다.</p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/new?mode=DUAL">함께 재판 시작하기</Link>
            </Button>
          </div>
          <div className="justify-self-center rounded-full bg-sun p-3">
            <JudgeArt persona="direct" />
            <p className="text-center text-sm font-black text-ink">정숙! 정숙!</p>
          </div>
        </div>
      </section>
      <aside className="press bg-white p-5">
        <p className="text-sm font-black text-hero">판사 5종 · 기준은 같고 말투만 다릅니다</p>
        <h2 className="mt-2 text-2xl font-black">오늘 누구한테 물어볼까?</h2>
        <p className="mt-3 leading-relaxed">원칙주의, 따뜻한 중재, 팩폭, 유머, 조선시대 사또. 책임 비율은 같은 기준으로 나옵니다.</p>
        <Button asChild variant="white" className="mt-5">
          <Link href="/judges">판사 소개</Link>
        </Button>
      </aside>
      <section className="grid gap-4 lg:col-span-2 md:grid-cols-3">
        {modes.map((mode) => (
          <Link key={mode.href} href={mode.href} className={`press block p-5 ${mode.className}`}>
            <p className="text-xs font-black">{mode.kicker}</p>
            <h2 className="mt-2 text-2xl font-black">{mode.title}</h2>
            <p className="mt-2 font-bold">{mode.body}</p>
            <p className="mt-6 font-black">{mode.action} ↗</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
