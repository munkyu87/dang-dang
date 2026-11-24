"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldLabel, TextInput } from "@/components/ui/field";
import { api } from "@/lib/api-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      router.push("/admin");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로그인하지 못했습니다.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-black">관리자</h1>
      <div className="press mt-4 bg-white p-5">
        <FieldLabel>비밀번호</FieldLabel>
        <TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="mt-3 font-black text-danger">{error}</p> : null}
        <Button className="mt-4" type="button" onClick={submit}>
          들어가기
        </Button>
      </div>
    </div>
  );
}
