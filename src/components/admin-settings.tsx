"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldLabel, TextInput } from "@/components/ui/field";
import { api } from "@/lib/api-client";

export function AdminSettings({ budget, caseLimit }: { budget: number; caseLimit: number }) {
  const router = useRouter();
  const [dailyBudgetKrw, setBudget] = useState(String(budget));
  const [dailyCaseLimit, setLimit] = useState(String(caseLimit));
  const [error, setError] = useState("");

  async function save() {
    setError("");
    try {
      await api("/api/admin/settings", {
        method: "POST",
        body: JSON.stringify({ dailyBudgetKrw: Number(dailyBudgetKrw), dailyCaseLimit: Number(dailyCaseLimit) }),
      });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "저장하지 못했습니다.");
    }
  }

  return (
    <section className="press bg-white p-5">
      <h2 className="font-black">한도</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label>
          <FieldLabel>하루 AI 예산 (원)</FieldLabel>
          <TextInput value={dailyBudgetKrw} onChange={(event) => setBudget(event.target.value)} />
        </label>
        <label>
          <FieldLabel>하루 사건 수</FieldLabel>
          <TextInput value={dailyCaseLimit} onChange={(event) => setLimit(event.target.value)} />
        </label>
      </div>
      {error ? <p className="mt-3 font-black text-danger">{error}</p> : null}
      <Button className="mt-4" type="button" onClick={save}>
        저장
      </Button>
    </section>
  );
}
