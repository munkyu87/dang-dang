import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb } from "@/db";
import { caseTokens, verdicts } from "@/db/schema";
import { AppError } from "@/lib/errors";
import {
  answerQuestion,
  claimToken,
  createCase,
  deleteCase,
  getShareByToken,
  issueShareToken,
  loadCaseForSession,
  peekInvite,
  rotateInvite,
  saveAdminSetting,
  setConsent,
  submitStatement,
} from "@/server/cases";
import { processDueJobs } from "@/server/pipeline";
import { withDb } from "./helpers";

const longA = "약속 시간에 교통이 막혀서 내가 늦은 건 맞다. 출발 전에 늦는다고 연락을 했고 일부러 늦은 것은 아니다.";
const longB = "친구는 30분이나 지각했다. 연락도 늦었고 이런 일이 반복된다. 미리 말하지 않았다. XQZMARKER";

function session(caseId: string, role: "A" | "B") {
  return { caseId, role };
}

describe("case flow", () => {
  it("함께 재판은 상대 원문을 숨기고 판결은 한 번만 만든다", async () => {
    await withDb(async () => {
      const created = createCase({
        mode: "DUAL",
        title: "지각 사건",
        category: "친구",
        judgeId: "judge_principle",
        limitKey: "dual-1",
      });
      const preview = peekInvite(created.bToken!);
      expect(preview.role).toBe("B");
      expect(getDb().select().from(caseTokens).all().every((row) => !row.claimedAt)).toBe(true);
      const a = claimToken(created.aToken);
      const b = claimToken(created.bToken!);
      const sessionA = session(a.caseId, "A");
      const sessionB = session(b.caseId, "B");
      submitStatement(sessionA, { body: longA });
      const waiting = loadCaseForSession(sessionA);
      expect(waiting.kind === "ok" && waiting.view.status).toBe("WAITING");
      submitStatement(sessionB, { body: longB });
      await processDueJobs();
      await processDueJobs();
      const viewA = loadCaseForSession(sessionA);
      const viewB = loadCaseForSession(sessionB);
      expect(JSON.stringify(viewA)).not.toContain("XQZMARKER");
      expect(viewB.kind === "ok" && viewB.view.mine?.body).toContain("XQZMARKER");
      expect(viewA.kind === "ok" && viewA.view.verdict?.fault && viewA.view.verdict.fault.A > 50).toBe(true);
      expect(viewA.kind === "ok" && viewA.view.verdict?.order.startsWith("약속은 약속입니다.")).toBe(true);
      expect(getDb().select().from(verdicts).all()).toHaveLength(1);
      expect(getDb().select().from(caseTokens).all().some((row) => row.tokenHash === created.aToken)).toBe(false);

      expect(() => getShareByToken("missing")).toThrow(AppError);
      setConsent(sessionA, true);
      expect(() => issueShareToken(sessionA)).toThrow(AppError);
      setConsent(sessionB, true);
      const share = issueShareToken(sessionA);
      const shared = getShareByToken(share.token);
      expect(shared.title).toBe("지각 사건");
      expect(shared.fault?.A).toBeGreaterThan(50);
      setConsent(sessionA, false);
      expect(() => getShareByToken(share.token)).toThrow(AppError);
    });
  });

  it("짧은 진술은 질문 뒤 판단 보류가 될 수 있다", async () => {
    await withDb(async () => {
      const created = createCase({
        mode: "DUAL",
        title: "짧은 다툼",
        category: "친구",
        judgeId: "judge_humor",
        limitKey: "short-1",
      });
      const a = claimToken(created.aToken);
      const b = claimToken(created.bToken!);
      submitStatement(session(a.caseId, "A"), { body: "그냥 화남" });
      submitStatement(session(b.caseId, "B"), { body: "나도 몰라" });
      await processDueJobs();
      const asking = loadCaseForSession(session(a.caseId, "A"));
      expect(asking.kind === "ok" && asking.view.status).toBe("QUESTIONING");
      answerQuestion(session(a.caseId, "A"), "잘 모르겠어");
      const other = loadCaseForSession(session(b.caseId, "B"));
      if (other.kind === "ok" && other.view.question) answerQuestion(session(b.caseId, "B"), "기억 안 나");
      await processDueJobs();
      const done = loadCaseForSession(session(a.caseId, "A"));
      expect(done.kind === "ok" && done.view.verdict?.fault).toBeNull();
      expect(done.kind === "ok" && done.view.status).toBe("INCONCLUSIVE");
    });
  });

  it("혼자 재판은 B가 없고 위협은 판결하지 않는다", async () => {
    await withDb(async () => {
      const created = createCase({
        mode: "SOLO",
        title: "혼잣말",
        category: "친구",
        judgeId: "judge_direct",
        limitKey: "solo-1",
      });
      expect(created.bToken).toBeNull();
      const a = claimToken(created.aToken);
      submitStatement(session(a.caseId, "A"), {
        body: "내가 늦은 건 맞다. 다만 상대가 먼저 장소를 바꿨다고 나는 들었다. 연락은 했다.",
        reportedOther: "상대는 내가 연락 없이 늦었다고 했대.",
      });
      await processDueJobs();
      const view = loadCaseForSession(session(a.caseId, "A"));
      expect(view.kind === "ok" && view.view.verdict?.statementSources.B).toBe("REPORTED");
      expect(view.kind === "ok" && view.view.otherSubmitted).toBeNull();

      const threat = createCase({
        mode: "SOLO",
        title: "위험한 말",
        category: "기타",
        judgeId: "judge_principle",
        limitKey: "solo-2",
      });
      const owner = claimToken(threat.aToken);
      submitStatement(session(owner.caseId, "A"), { body: "너무 화나서 죽여버리겠다는 말이 나왔다. 이건 일상 다툼이 아니다." });
      await processDueJobs();
      const blocked = loadCaseForSession(session(owner.caseId, "A"));
      expect(blocked.kind === "ok" && blocked.view.status).toBe("BLOCKED");
      expect(blocked.kind === "ok" && blocked.view.verdict).toBeNull();
      expect(JSON.stringify(blocked)).not.toContain("VIOLENCE");
    });
  });

  it("생성 한도와 예산 상한을 지킨다", async () => {
    await withDb(async () => {
      saveAdminSetting("daily_case_limit", 1);
      createCase({ mode: "SOLO", title: "첫째", category: "기타", judgeId: "judge_principle", limitKey: "limit-user" });
      expect(() =>
        createCase({ mode: "SOLO", title: "둘째", category: "기타", judgeId: "judge_principle", limitKey: "limit-user" }),
      ).toThrow(AppError);

      saveAdminSetting("daily_budget_krw", 0);
      const created = createCase({
        mode: "SOLO",
        title: "예산",
        category: "친구",
        judgeId: "judge_mediator",
        limitKey: "other-user",
      });
      const a = claimToken(created.aToken);
      submitStatement(session(a.caseId, "A"), { body: longA });
      await processDueJobs();
      const held = loadCaseForSession(session(a.caseId, "A"));
      expect(held.kind === "ok" && held.view.holdReason).toBe("BUDGET");
      expect(getDb().select().from(verdicts).where(eq(verdicts.caseId, a.caseId)).all()).toHaveLength(0);
    });
  });

  it("삭제하면 다시 열 수 없고 초대 링크를 바꿀 수 있다", async () => {
    await withDb(async () => {
      const created = createCase({
        mode: "DUAL",
        title: "삭제 시험",
        category: "가족",
        judgeId: "judge_satto",
        limitKey: "delete-1",
      });
      const a = claimToken(created.aToken);
      const rotated = rotateInvite(session(a.caseId, "A"));
      expect(() => claimToken(created.bToken!)).toThrow(AppError);
      expect(claimToken(rotated.token).role).toBe("B");
      deleteCase(session(a.caseId, "A"));
      expect(loadCaseForSession(session(a.caseId, "A")).kind).toBe("missing");
    });
  });
});
