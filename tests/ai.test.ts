import { describe, expect, it } from "vitest";
import { applyPersona } from "@/lib/ai/persona";
import { mockClassify, mockJudge } from "@/lib/ai/mock";
import { verdictSchema } from "@/lib/ai/schema";
import { detectBlock } from "@/lib/safety";

const longA = "약속 시간에 교통이 막혀서 내가 늦은 건 맞다. 출발 전에 늦는다고 연락을 했고 일부러 늦은 것은 아니다.";
const longB = "친구는 30분이나 지각했다. 연락도 늦었고 이런 일이 반복된다. 미리 말하지 않았다.";

describe("ai", () => {
  it("욕설만으로 차단하지 않는다", () => {
    expect(detectBlock("진짜 씨발 너무 화나")).toBeNull();
    const result = mockClassify({
      mode: "DUAL",
      statements: { A: { body: `${longA} 씨발` }, B: { body: longB } },
      answers: [],
      alreadyAsked: false,
    });
    expect(result.data.decision).toBe("PROCEED");
  });

  it("위협은 차단한다", () => {
    expect(detectBlock("죽여버리겠다")).toBe("VIOLENCE");
  });

  it("비율 합은 100이고 문체는 비율을 바꾸지 않는다", () => {
    const judged = mockJudge({
      mode: "DUAL",
      title: "지각",
      category: "친구",
      personaKey: "principle",
      statements: { A: { body: longA }, B: { body: longB } },
      answers: [],
      alreadyAsked: true,
    });
    const parsed = verdictSchema.parse(judged.data);
    expect(parsed.fault?.A).toBeGreaterThan(50);
    expect(parsed.fault && parsed.fault.A + parsed.fault.B).toBe(100);
    const styled = applyPersona(parsed, "principle");
    expect(styled.fault).toEqual(parsed.fault);
    expect(styled.order.startsWith("약속은 약속입니다.")).toBe(true);
  });

  it("정보가 부족하면 비율이 없다", () => {
    const judged = mockJudge({
      mode: "DUAL",
      title: "짧은 다툼",
      category: "친구",
      personaKey: "humor",
      statements: { A: { body: "그냥 화남" }, B: { body: "나도 잘 모르겠어" } },
      answers: [],
      alreadyAsked: true,
    });
    expect(judged.data.verdictType).toBe("INCONCLUSIVE");
    expect(judged.data.fault).toBeNull();
  });
});
