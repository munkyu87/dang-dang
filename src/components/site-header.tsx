import Link from "next/link";
import { LogoMark } from "@/components/judge-art";

export function SiteHeader() {
  return (
    <header className="border-b-2 border-ink bg-sun">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-black">
          <LogoMark />
          땅땅!
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-black sm:flex">
          <Link href="/guide">이용방법</Link>
          <Link href="/judges">판사 소개</Link>
          <Link href="/demo">체험</Link>
        </nav>
        <details className="relative sm:hidden">
          <summary className="cursor-pointer list-none rounded-[8px] border-2 border-ink bg-white px-3 py-2 text-sm font-black">
            메뉴
          </summary>
          <div className="absolute right-0 z-10 mt-2 grid w-40 gap-2 border-2 border-ink bg-white p-3 font-black shadow-[4px_4px_0_#18171B]">
            <Link href="/guide">이용방법</Link>
            <Link href="/judges">판사 소개</Link>
            <Link href="/demo">체험</Link>
          </div>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-[1200px] px-4 py-8 text-sm font-bold text-ink/80">
      회원가입 없이 이용 · 재미용이며 법적 효력 없음
    </footer>
  );
}
