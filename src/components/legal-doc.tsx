import type { ReactNode } from "react";

export function LegalDoc({ title, children }: { title: string; children: ReactNode }) {
  const contact = process.env.CONTACT_EMAIL?.trim();
  return (
    <article className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
      <p className="text-sm font-black text-hero">2026년 11월 24일 초안</p>
      <h1 className="text-4xl font-black">{title}</h1>
      <p className="font-bold">
        이 문서는 땅땅!의 실제 동작에 맞춘 초안입니다. 변호사 검토를 대신하지 않습니다. 공개 출시 전에 외부 AI 업체의 처리 지역과 연락처를 확인해야 합니다.
      </p>
      {children}
      <section className="press bg-white p-5">
        <h2 className="text-2xl font-black">문의</h2>
        <p className="mt-2 leading-relaxed">
          {contact
            ? `운영자 연락처는 ${contact} 입니다.`
            : "운영자 연락처는 아직 이 문서에 없습니다. 공개 출시 전에 환경변수 CONTACT_EMAIL로 적습니다."}
        </p>
      </section>
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="press bg-white p-5">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-2 grid gap-2 leading-relaxed">{children}</div>
    </section>
  );
}
