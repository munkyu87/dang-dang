"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import type { CaseView } from "@/lib/types";

export function VerdictActions({ view }: { view: CaseView }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState("");
  const [sharePath, setSharePath] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(`dd-share-${view.id}`);
    if (saved) setSharePath(saved);
  }, [view.id]);

  async function run(key: string, task: () => Promise<void>) {
    setPending(key);
    setError("");
    try {
      await task();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "처리하지 못했습니다.");
    } finally {
      setPending("");
    }
  }

  async function consent(granted: boolean) {
    await run("consent", async () => {
      await api(`/api/cases/${view.id}/consents`, { method: "POST", body: JSON.stringify({ granted }) });
    });
  }

  async function makeShare() {
    await run("share", async () => {
      const data = await api<{ token: string }>(`/api/cases/${view.id}/share`, { method: "POST", body: "{}" });
      const path = `/share/${data.token}`;
      sessionStorage.setItem(`dd-share-${view.id}`, path);
      setSharePath(path);
    });
  }

  function downloadPng() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx || !view.verdict) return;
    const family = getComputedStyle(document.body).fontFamily;
    ctx.fillStyle = "#7652F4";
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = "#FFE34F";
    ctx.font = `900 84px ${family}`;
    ctx.fillText("땅땅!", 72, 140);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `700 42px ${family}`;
    ctx.fillText(view.verdict.mode === "SOLO" ? "혼자 재판" : view.title, 72, 230);
    ctx.font = `900 64px ${family}`;
    if (view.verdict.fault) {
      ctx.fillText(`A ${view.verdict.fault.A}%    B ${view.verdict.fault.B}%`, 72, 360);
    } else {
      ctx.fillText(view.verdict.verdictType === "NO_FAULT" ? "쌍방 책임 없음" : "판단 보류", 72, 360);
    }
    ctx.font = `700 40px ${family}`;
    wrapText(ctx, view.verdict.order, 72, 480, 920, 56);
    ctx.font = `500 28px ${family}`;
    ctx.fillText("재미용 가상 판결 · 법적 효력 없음", 72, 980);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${view.caseNumber}.png`;
    link.click();
  }

  const canShare = view.consents.shareReady && view.verdict;
  return (
    <section className="press bg-cream p-5">
      <h2 className="text-xl font-black">공유 동의</h2>
      <p className="mt-2 font-bold">
        {view.mode === "DUAL"
          ? `내 동의 ${view.consents.mine ? "완료" : "대기"} · 상대 동의 ${view.consents.other ? "완료" : "대기"}`
          : view.consents.mine
            ? "작성자 동의가 있습니다. 공유본에는 사건명 대신 혼자 재판이라고만 나갑니다."
            : "공유하려면 작성자 동의가 필요합니다."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant={view.consents.mine ? "white" : "sun"} disabled={pending !== ""} onClick={() => consent(!view.consents.mine)}>
          {pending === "consent" ? "저장 중…" : view.consents.mine ? "동의 철회" : "공유에 동의"}
        </Button>
        <Button type="button" variant="hero" disabled={!canShare || pending !== ""} onClick={makeShare}>
          {pending === "share" ? "만드는 중…" : "공유 링크 만들기"}
        </Button>
        <Button type="button" variant="white" disabled={!canShare} onClick={downloadPng}>
          PNG 저장
        </Button>
        {view.status === "FAILED" ? (
          <Button
            type="button"
            disabled={pending !== ""}
            onClick={() =>
              run("retry", async () => {
                await api(`/api/cases/${view.id}/judge`, { method: "POST", body: "{}" });
                router.push(`/case/${view.id}/status`);
              })
            }
          >
            다시 시도
          </Button>
        ) : null}
        <Button
          type="button"
          variant="danger"
          disabled={pending !== ""}
          onClick={() => {
            if (!window.confirm("사건과 접근 링크를 삭제할까요?")) return;
            void run("delete", async () => {
              await api(`/api/cases/${view.id}`, { method: "DELETE" });
              router.push("/");
            });
          }}
        >
          사건 삭제
        </Button>
      </div>
      {sharePath ? (
        <p className="mt-4 break-all font-black">
          공유 링크: {sharePath}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => navigator.clipboard.writeText(window.location.origin + sharePath)}
          >
            복사
          </button>
        </p>
      ) : null}
      {error ? <p className="mt-3 font-black text-danger">{error}</p> : null}
    </section>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  let line = "";
  let cursor = y;
  for (const char of text) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth) {
      ctx.fillText(line, x, cursor);
      line = char;
      cursor += lineHeight;
    } else {
      line = next;
    }
  }
  ctx.fillText(line, x, cursor);
}
