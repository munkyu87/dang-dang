import type { Mode } from "@/lib/types";
import type { AiResult, ClassifyResult, VerdictDraft } from "@/lib/ai/schema";
import { detectBlock } from "@/lib/safety";

export type StatementSide = { body: string; reportedOther?: string | null };
export type ClassifyInput = {
  mode: Mode;
  statements: { A?: StatementSide; B?: StatementSide };
  answers: string[];
  alreadyAsked: boolean;
};
export type JudgeInput = ClassifyInput & {
  title: string;
  category: string;
  personaKey: string;
};

const USAGE = { model: "mock-judge", inputTokens: 120, outputTokens: 80, costKrw: 5 };

function summarize(text: string | undefined, party: "A" | "B") {
  const value = text?.trim() ?? "";
  if (!value) return "확인된 진술이 없음";
  if (/늦|지각|연락/.test(value)) {
    return party === "A" ? "시간 약속과 연락에 대한 사정을 말함" : "지각과 연락 지연을 문제 삼음";
  }
  if (/설거지|청소|쓰레기|집안/.test(value)) return "집안일 분담에 대한 주장을 함";
  if (/치킨|마지막/.test(value)) return "남은 음식을 누가 먹었는지 주장함";
  return "자신의 입장과 그때의 상황을 설명함";
}

function selfBlame(text: string) {
  return /내가\s*(늦|잘못|까먹)|늦은 건 맞/.test(text) ? 1 : 0;
}

function blameA(text: string) {
  return /지각|늦었|연락이 늦|잠수/.test(text) ? 1 : 0;
}

function blameB(text: string) {
  return /네가\s*(늦|잘못)|상대가\s*먼저/.test(text) ? 1 : 0;
}

function orderFor(category: string) {
  if (category === "룸메이트") return "이번 주 할 일을 둘이 나눠 적기";
  if (category === "친구") return "다음 약속에는 10분 일찍 출발하기";
  return "오늘은 여기서 마무리하고 다음에 미리 말하기";
}

export function mockClassify(input: ClassifyInput): AiResult<ClassifyResult> {
  const blob = [
    input.statements.A?.body,
    input.statements.A?.reportedOther,
    input.statements.B?.body,
    ...input.answers,
  ]
    .filter(Boolean)
    .join("\n");
  const block = detectBlock(blob);
  if (block) {
    return { data: { decision: "BLOCK", questions: [], reasonCode: block }, usage: USAGE };
  }
  if (input.alreadyAsked) {
    return { data: { decision: "PROCEED", questions: [], reasonCode: null }, usage: USAGE };
  }
  const aLen = input.statements.A?.body.trim().length ?? 0;
  const bLen = input.statements.B?.body.trim().length ?? 0;
  if (input.mode === "SOLO" && aLen < 40) {
    return {
      data: {
        decision: "QUESTION",
        questions: [{ party: "A", text: "그때 서로 약속한 내용이 있었나요? 기억나는 만큼만 적어 주세요." }],
        reasonCode: null,
      },
      usage: USAGE,
    };
  }
  if (input.mode === "DUAL" && (aLen < 40 || bLen < 40)) {
    const party = aLen <= bLen ? "A" : "B";
    return {
      data: {
        decision: "QUESTION",
        questions: [{ party, text: "상대에게 미리 알린 적이 있나요? 시각이 기억나면 적어 주세요." }],
        reasonCode: null,
      },
      usage: USAGE,
    };
  }
  return { data: { decision: "PROCEED", questions: [], reasonCode: null }, usage: USAGE };
}

export function mockJudge(input: JudgeInput): AiResult<VerdictDraft> {
  const a = input.statements.A?.body ?? "";
  const b = input.statements.B?.body ?? "";
  const reported = input.statements.A?.reportedOther ?? "";
  const other = input.mode === "DUAL" ? b : reported;
  const sources = {
    A: "DIRECT" as const,
    B: input.mode === "DUAL" ? ("DIRECT" as const) : reported.trim() ? ("REPORTED" as const) : ("NONE" as const),
  };
  const base = {
    mode: input.mode,
    statementSources: sources,
    title: input.title.slice(0, 80),
    issues: ["약속과 행동", "연락과 설명"],
    claims: { A: summarize(a, "A"), B: summarize(other, "B") },
    agreedFacts: /늦|지각/.test(a) && /늦|지각/.test(other) ? ["약속 시간에 늦은 일이 양쪽 이야기에서 언급됨"] : [],
    disputedFacts: ["서로 다르게 말하는 세부 사실이 있음"],
    limitations:
      input.mode === "SOLO"
        ? "상대방의 직접 진술은 확인되지 않았습니다."
        : "양쪽 진술 외에 확인된 증거는 없습니다.",
    blockedReason: null,
  };
  const joined = `${a}\n${b}\n${reported}\n${input.answers.join("\n")}`;
  if (/둘 다 잘못 없|오해였/.test(joined)) {
    return {
      data: {
        ...base,
        verdictType: "NO_FAULT",
        fault: null,
        reason: "제공된 진술만으로는 어느 한쪽에 책임을 두기 어렵습니다.",
        order: "오늘은 오해로 두고 다음에 미리 말하기",
      },
      usage: USAGE,
    };
  }
  const thin =
    input.mode === "SOLO"
      ? a.trim().length < 80 && !/내가\s*(늦|잘못)|늦은 건 맞/.test(a)
      : a.trim().length < 40 || b.trim().length < 40 || /잘 모르|기억 안/.test(joined);
  if (thin) {
    return {
      data: {
        ...base,
        verdictType: "INCONCLUSIVE",
        fault: null,
        reason: "판단을 뒷받침할 내용이 부족합니다.",
        order: "기억나는 사실만 다시 한 줄로 적어 보기",
        disputedFacts: ["핵심 사실이 비어 있음"],
      },
      usage: USAGE,
    };
  }
  const aWeight = 1 + selfBlame(a) + blameA(other);
  const bWeight = 1 + selfBlame(input.mode === "DUAL" ? b : "") + blameB(a);
  const faultA = Math.round((aWeight / (aWeight + bWeight)) * 100);
  return {
    data: {
      ...base,
      verdictType: "FAULT_RATIO",
      fault: { A: faultA, B: 100 - faultA },
      reason: "제공된 진술을 기준으로 행동과 연락, 사후 대응을 함께 봤습니다.",
      order: orderFor(input.category),
    },
    usage: USAGE,
  };
}
