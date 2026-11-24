export type JudgeProfile = {
  id: string;
  name: string;
  personaKey: string;
  summary: string;
  line: string;
};

export const JUDGES: JudgeProfile[] = [
  {
    id: "judge_principle",
    name: "원칙주의 판사",
    personaKey: "principle",
    summary: "논리와 원칙",
    line: "약속은 약속입니다.",
  },
  {
    id: "judge_mediator",
    name: "따뜻한 중재 판사",
    personaKey: "mediator",
    summary: "감정과 공감",
    line: "서로의 마음도 들어볼게요.",
  },
  {
    id: "judge_direct",
    name: "팩폭 판사",
    personaKey: "direct",
    summary: "시원한 직설",
    line: "변명보다 행동을 봅시다.",
  },
  {
    id: "judge_humor",
    name: "유머 판사",
    personaKey: "humor",
    summary: "재치와 유머",
    line: "오늘은 웃고 넘기는 쪽으로!",
  },
  {
    id: "judge_satto",
    name: "조선시대 사또",
    personaKey: "satto",
    summary: "사극 말투",
    line: "네 이놈, 약속은 지켜야지!",
  },
];

export function judgeById(id: string) {
  return JUDGES.find((judge) => judge.id === id) ?? null;
}
