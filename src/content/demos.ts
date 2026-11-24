export type DemoCase = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  a: string;
  b: string;
  fault: { A: number; B: number } | null;
  verdictType: "FAULT_RATIO" | "NO_FAULT";
  reason: string;
  order: string;
};

export const DEMOS: DemoCase[] = [
  {
    slug: "chicken",
    title: "마지막 치킨 사건",
    category: "친구",
    summary: "야식 치킨 한 조각의 행방.",
    a: "남은 한 조각은 내일 먹기로 했다.",
    b: "배고파서 먹었고, 나중에 말하려고 했다.",
    fault: { A: 35, B: 65 },
    verdictType: "FAULT_RATIO",
    reason: "남겨 두기로 한 조각을 먼저 먹은 쪽이 더 크다. 미리 말하지 않은 점도 함께 봤다.",
    order: "다음 야식은 처음부터 반반으로 정하기",
  },
  {
    slug: "late",
    title: "약속 시간 30분 지각 사건",
    category: "친구",
    summary: "지각과 늦은 연락.",
    a: "차가 막혀 늦었고 출발 때 연락했다.",
    b: "연락은 거의 도착할 때 왔고, 지각이 반복된다.",
    fault: { A: 70, B: 30 },
    verdictType: "FAULT_RATIO",
    reason: "늦은 사실과 연락 시점을 함께 봤다. 막힌 사정은 있으나 늦은 연락이 더 크다.",
    order: "다음 약속에는 10분 일찍 출발하기",
  },
  {
    slug: "dishes",
    title: "설거지 분담 사건",
    category: "룸메이트",
    summary: "누가 더 집안일을 했는가.",
    a: "이번 주 설거지는 내가 더 했다.",
    b: "분리수거는 내가 계속 했다.",
    fault: { A: 50, B: 50 },
    verdictType: "FAULT_RATIO",
    reason: "서로 다른 집안일을 맡았고, 어느 한쪽만 잘못이라고 볼 내용이 부족하다.",
    order: "이번 주 할 일을 둘이 나눠 적기",
  },
];

export const PERSONA_PREFIX: Record<string, string> = {
  principle: "약속은 약속입니다.",
  mediator: "서로의 마음도 들어볼게요.",
  direct: "변명보다 행동을 봅시다.",
  humor: "오늘은 웃고 넘기는 쪽으로!",
  satto: "네 이놈, 약속은 지켜야지!",
};
