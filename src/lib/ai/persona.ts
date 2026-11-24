import type { VerdictDraft } from "@/lib/ai/schema";

const ORDER_PREFIX: Record<string, (order: string) => string> = {
  principle: (order) => `약속은 약속입니다. ${order}`,
  mediator: (order) => `서로의 마음도 들어볼게요. ${order}`,
  direct: (order) => `변명보다 행동을 봅시다. ${order}`,
  humor: (order) => `${order} 오늘은 웃고 넘기는 쪽으로!`,
  satto: (order) => `네 이놈, ${order}`,
};

export function applyPersona(verdict: VerdictDraft, personaKey: string): VerdictDraft {
  const style = ORDER_PREFIX[personaKey] ?? ((order: string) => order);
  const order = style(verdict.order).slice(0, 200);
  return {
    ...verdict,
    order,
    fault: verdict.fault ? { A: verdict.fault.A, B: verdict.fault.B } : null,
  };
}
