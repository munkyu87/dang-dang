"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldLabel, SelectInput, TextInput } from "@/components/ui/field";
import { api } from "@/lib/api-client";

type AiPublic = {
  provider: "mock" | "openai";
  baseUrl: string;
  model: string;
  hasApiKey: boolean;
  keySource: "admin" | "env" | "none";
};

const keyLabel: Record<AiPublic["keySource"], string> = {
  admin: "관리자 페이지에 저장된 키를 사용 중입니다.",
  env: "환경변수 키를 사용 중입니다. 여기에 저장하면 그 키가 우선합니다.",
  none: "저장된 키가 없습니다. openai를 고르면 판결이 실패합니다.",
};

export function AdminSettings({ budget, caseLimit, ai }: { budget: number; caseLimit: number; ai: AiPublic }) {
  const router = useRouter();
  const [dailyBudgetKrw, setBudget] = useState(String(budget));
  const [dailyCaseLimit, setLimit] = useState(String(caseLimit));
  const [provider, setProvider] = useState(ai.provider);
  const [baseUrl, setBaseUrl] = useState(ai.baseUrl);
  const [model, setModel] = useState(ai.model);
  const [apiKey, setApiKey] = useState("");
  const [clearApiKey, setClearApiKey] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    setError("");
    try {
      await api("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify({
          dailyBudgetKrw: Number(dailyBudgetKrw),
          dailyCaseLimit: Number(dailyCaseLimit),
          provider,
          baseUrl,
          model,
          apiKey,
          clearApiKey: clearApiKey && apiKey.trim() === "",
        }),
      });
      setApiKey("");
      setClearApiKey(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "저장하지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4">
      <section className="press bg-white p-5">
        <h2 className="font-black">한도</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label>
            <FieldLabel>하루 AI 예산 (원)</FieldLabel>
            <TextInput value={dailyBudgetKrw} inputMode="numeric" onChange={(event) => setBudget(event.target.value)} />
          </label>
          <label>
            <FieldLabel>하루 사건 수</FieldLabel>
            <TextInput value={dailyCaseLimit} inputMode="numeric" onChange={(event) => setLimit(event.target.value)} />
          </label>
        </div>
      </section>
      <section className="press bg-white p-5">
        <h2 className="font-black">AI 연결</h2>
        <p className="mt-2 text-sm font-bold">{keyLabel[ai.keySource]}</p>
        <div className="mt-3 grid gap-3">
          <label>
            <FieldLabel>공급자</FieldLabel>
            <SelectInput value={provider} onChange={(event) => setProvider(event.target.value as AiPublic["provider"])}>
              <option value="mock">mock · 규칙 기반</option>
              <option value="openai">OpenAI 호환 API</option>
            </SelectInput>
          </label>
          <label>
            <FieldLabel>API 주소</FieldLabel>
            <TextInput value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} spellCheck={false} />
          </label>
          <label>
            <FieldLabel>모델</FieldLabel>
            <TextInput value={model} onChange={(event) => setModel(event.target.value)} spellCheck={false} />
          </label>
          <label>
            <FieldLabel>API 키</FieldLabel>
            <TextInput
              type="password"
              value={apiKey}
              autoComplete="new-password"
              placeholder={ai.hasApiKey ? "비워 두면 기존 키를 유지합니다" : "sk-..."}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>
          {ai.keySource === "admin" ? (
            <label className="flex items-center gap-2 font-bold">
              <input type="checkbox" checked={clearApiKey} onChange={(event) => setClearApiKey(event.target.checked)} />
              저장된 키 지우기
            </label>
          ) : null}
        </div>
      </section>
      {error ? <p className="font-black text-danger">{error}</p> : null}
      <Button type="button" disabled={pending} onClick={save}>
        {pending ? "저장 중…" : "저장"}
      </Button>
    </div>
  );
}
