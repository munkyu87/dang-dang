"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import { api } from "@/lib/api-client";
import { formatKst } from "@/lib/utils";

export function QuestionForm({ caseId, question, expiresAt }: { caseId: string; question: string; expiresAt: number }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError("");
    try {
      await api(`/api/cases/${caseId}/answers`, { method: "POST", body: JSON.stringify({ answer }) });
      router.push(`/case/${caseId}/status`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "답변을 보내지 못했습니다.");
      setPending(false);
    }
  }

  return (
    <section className="press bg-white p-5">
      <p className="text-sm font-black text-hero">판사님의 추가 질문 · {formatKst(expiresAt)}까지</p>
      <h1 className="mt-2 text-2xl font-black">{question}</h1>
      <TextArea className="mt-4" maxLength={500} value={answer} onChange={(event) => setAnswer(event.target.value)} />
      <p className="mt-2 text-sm font-bold">{answer.length}/500</p>
      {error ? <p className="mt-2 font-black text-danger">{error}</p> : null}
      <Button className="mt-4" type="button" disabled={pending || answer.trim().length === 0} onClick={submit}>
        {pending ? "보내는 중…" : "답변 제출"}
      </Button>
    </section>
  );
}
