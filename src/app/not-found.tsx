import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="press bg-white p-6">
        <h1 className="text-3xl font-black">이 페이지는 없습니다</h1>
        <p className="mt-3 font-bold">비공개 사건은 권한이 없으면 없는 것처럼 보입니다.</p>
        <Link href="/" className="mt-4 inline-block font-black">
          땅땅!으로
        </Link>
      </div>
    </div>
  );
}
