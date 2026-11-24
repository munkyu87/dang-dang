"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JudgeArt } from "@/components/judge-art";
import { Button } from "@/components/ui/button";
import { FieldLabel, SelectInput, TextArea, TextInput } from "@/components/ui/field";
import { CATEGORIES } from "@/lib/constants";
import { api } from "@/lib/api-client";
import type { Mode } from "@/lib/types";

type JudgeOption = { id: string; name: string; personaKey: string; summary: string };

export function NewCaseForm({ mode, judges }: { mode: Mode; judges: JudgeOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[2]);
  const [summary, setSummary] = useState("");
  const [judgeId, setJudgeId] = useState(judges[0]?.id ?? "judge_principle");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    setError("");
    try {
      const data = await api<{ caseId: string; aToken: string; bToken: string | null }>("/api/cases", {
        method: "POST",
        body: JSON.stringify({ mode, title, category, summary, judgeId }),
      });
      sessionStorage.setItem(`dd-links-${data.caseId}`, JSON.stringify({ aToken: data.aToken, bToken: data.bToken }));
      router.push(mode === "SOLO" ? `/case/${data.caseId}/solo` : `/case/${data.caseId}/invite`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "사건을 만들지 못했습니다.");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4">
      <section className="press bg-white p-5">
        <FieldLabel>사건명 · {title.trim().length}/50</FieldLabel>
        <TextInput value={title} maxLength={50} onChange={(event) => setTitle(event.target.value)} placeholder="약속 시간 30분 지각 사건" />
        <div className="mt-4">
          <FieldLabel>카테고리</FieldLabel>
          <SelectInput value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </SelectInput>
        </div>
        <div className="mt-4">
          <FieldLabel>한 줄 설명 · 선택 {summary.trim().length}/300</FieldLabel>
          <TextArea value={summary} maxLength={300} className="min-h-24" onChange={(event) => setSummary(event.target.value)} />
          <p className="mt-2 text-sm font-bold">이 설명은 사실이 아니라 작성자의 주장으로 다룹니다.</p>
        </div>
      </section>
      <section className="grid gap-3">
        <h2 className="text-2xl font-black">누구로 할까요?</h2>
        {judges.map((judge) => (
          <label key={judge.id} className={`press flex cursor-pointer items-center gap-3 p-3 ${judgeId === judge.id ? "bg-sun" : "bg-white"}`}>
            <input type="radio" name="judge" className="h-5 w-5" checked={judgeId === judge.id} onChange={() => setJudgeId(judge.id)} />
            <JudgeArt persona={judge.personaKey} className="h-16 w-16" />
            <span>
              <span className="block font-black">{judge.name}</span>
              <span className="text-sm font-bold">{judge.summary}</span>
            </span>
          </label>
        ))}
      </section>
      {error ? <p className="font-black text-danger">{error}</p> : null}
      <Button type="button" size="lg" disabled={pending || title.trim().length === 0} onClick={submit}>
        {pending ? "만드는 중…" : "사건 만들기"}
      </Button>
    </div>
  );
}
