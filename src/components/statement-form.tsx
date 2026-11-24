"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldLabel, TextArea } from "@/components/ui/field";
import { api } from "@/lib/api-client";

export function StatementForm({
  caseId,
  solo,
  initialBody = "",
}: {
  caseId: string;
  solo: boolean;
  initialBody?: string;
}) {
  const router = useRouter();
  const storageKey = `dd-draft-${caseId}`;
  const [body, setBody] = useState(initialBody);
  const [reported, setReported] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { body?: string; reported?: string };
      if (parsed.body) setBody(parsed.body);
      if (parsed.reported) setReported(parsed.reported);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  function saveDraft() {
    localStorage.setItem(storageKey, JSON.stringify({ body, reported }));
  }

  async function submit() {
    setPending(true);
    setError("");
    try {
      await api(`/api/cases/${caseId}/statements`, {
        method: "POST",
        body: JSON.stringify({ body, reportedOther: solo ? reported : undefined }),
      });
      localStorage.removeItem(storageKey);
      router.push(`/case/${caseId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "제출하지 못했습니다.");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4">
      <section className="press bg-white p-5">
        <FieldLabel>내 진술 · {body.length}/2000</FieldLabel>
        <TextArea value={body} maxLength={2000} onChange={(event) => setBody(event.target.value)} placeholder="그때 무슨 일이 있었는지 적어 주세요." />
        <p className="mt-2 text-sm font-bold">거친 표현도 그대로 둡니다. 제출하면 수정할 수 없고, 상대에게 원문은 보이지 않습니다.</p>
      </section>
      {solo ? (
        <section className="press bg-party-a/40 p-5">
          <FieldLabel>상대 주장 · 선택, 내가 전하는 말 · {reported.length}/2000</FieldLabel>
          <TextArea value={reported} maxLength={2000} onChange={(event) => setReported(event.target.value)} placeholder="상대가 직접 확인한 내용이 아닙니다." />
        </section>
      ) : null}
      {error ? <p className="font-black text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="white" onClick={saveDraft}>
          임시저장
        </Button>
        <Button type="button" disabled={pending || body.trim().length === 0} onClick={submit}>
          {pending ? "제출 중…" : "제출"}
        </Button>
      </div>
    </div>
  );
}
