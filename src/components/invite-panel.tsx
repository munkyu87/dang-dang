"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export function InviteClaim({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function claim() {
    setPending(true);
    setError("");
    try {
      const data = await api<{ caseId: string }>(`/api/access/claim`, { method: "POST", body: JSON.stringify({ token }) });
      router.push(`/case/${data.caseId}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "참여하지 못했습니다.");
      setPending(false);
    }
  }

  return (
    <div>
      <Button type="button" size="lg" disabled={pending} onClick={claim}>
        {pending ? "들어가는 중…" : "내 진술 쓰러 가기"}
      </Button>
      {error ? <p className="mt-3 font-black text-danger">{error}</p> : null}
    </div>
  );
}

export function InviteLinks({ caseId }: { caseId: string }) {
  const [bToken, setBToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem(`dd-links-${caseId}`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { bToken?: string | null };
      setBToken(parsed.bToken ?? null);
    } catch {
      sessionStorage.removeItem(`dd-links-${caseId}`);
    }
  }, [caseId]);

  async function rotate() {
    setError("");
    try {
      const data = await api<{ token: string }>(`/api/cases/${caseId}/invite`, { method: "POST", body: "{}" });
      setBToken(data.token);
      sessionStorage.setItem(`dd-links-${caseId}`, JSON.stringify({ bToken: data.token }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "링크를 바꾸지 못했습니다.");
    }
  }

  const link = bToken ? `${window.location.origin}/invite/${bToken}` : "";
  return (
    <section className="press bg-white p-5">
      <h2 className="text-xl font-black">상대 초대 링크</h2>
      {bToken ? (
        <p className="mt-3 break-all font-bold">{link}</p>
      ) : (
        <p className="mt-3 font-bold">이 브라우저에 저장된 링크가 없습니다. 다시 만들 수 있습니다. 이전 링크는 멈춥니다.</p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="white" disabled={!bToken} onClick={() => navigator.clipboard.writeText(link)}>
          복사
        </Button>
        <Button type="button" onClick={rotate}>
          링크 다시 만들기
        </Button>
      </div>
      {error ? <p className="mt-3 font-black text-danger">{error}</p> : null}
    </section>
  );
}
