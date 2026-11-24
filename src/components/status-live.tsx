"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { JudgeArt } from "@/components/judge-art";

const copy: Record<string, string> = {
  WAITING: "상대 진술을 기다리고 있습니다.",
  READY: "양쪽 이야기가 모여 판결을 준비합니다.",
  QUESTIONING: "상대에게 추가 질문이 전달됐습니다.",
  JUDGING: "진술을 읽고 판결문을 쓰고 있습니다.",
  FAILED: "판결을 마치지 못했습니다.",
};

export function StatusLive({
  caseId,
  status,
  persona,
  mine,
  other,
  holdReason,
}: {
  caseId: string;
  status: string;
  persona: string;
  mine: boolean;
  other: boolean | null;
  holdReason: string | null;
}) {
  const router = useRouter();
  useEffect(() => {
    let timer = 0;
    const terminal = ["COMPLETED", "INCONCLUSIVE", "BLOCKED", "FAILED", "EXPIRED", "DELETED"].includes(status);
    async function poll() {
      if (document.hidden) return;
      const response = await fetch(`/api/cases/${caseId}/status`, { cache: "no-store" });
      if (!response.ok) return;
      const body = (await response.json()) as {
        data?: { view?: { status?: string; question?: { text: string } | null } };
      };
      const nextView = body.data?.view;
      if (nextView?.question) {
        router.push(`/case/${caseId}/question`);
        return;
      }
      const next = nextView?.status;
      if (next && ["COMPLETED", "INCONCLUSIVE", "BLOCKED", "FAILED"].includes(next)) {
        router.push(`/case/${caseId}/verdict`);
        return;
      }
      if (next && next !== status) router.refresh();
    }
    if (!terminal) {
      void poll();
      timer = window.setInterval(() => void poll(), 4000);
    }
    return () => window.clearInterval(timer);
  }, [caseId, router, status]);

  return (
    <section className="press bg-white p-5">
      <JudgeArt persona={persona} className="h-28 w-28" />
      <h1 className="mt-3 text-3xl font-black">{holdReason === "BUDGET" ? "오늘 판결 한도에 걸렸습니다" : "재판 진행"}</h1>
      <p className="mt-2 text-lg font-bold">{holdReason === "BUDGET" ? "이미 나온 결과는 볼 수 있고, 새 판결은 잠시 쉽니다." : copy[status] ?? "상태를 확인하고 있습니다."}</p>
      <ul className="mt-4 grid gap-2 font-black">
        <li>{mine ? "✓ 내 진술 제출" : "○ 내 진술 대기"}</li>
        {other === null ? null : <li>{other ? "✓ 상대 진술 제출" : "○ 상대 진술 대기"}</li>}
      </ul>
    </section>
  );
}
