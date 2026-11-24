export type JudgeExpression = "base" | "think" | "question" | "verdict";

const JUDGES = ["principle", "mediator", "direct", "humor", "satto"] as const;

export function judgeExpressionForStatus(status: string): JudgeExpression {
  if (status === "QUESTIONING") return "question";
  if (status === "WAITING" || status === "READY" || status === "JUDGING") return "think";
  if (status === "COMPLETED" || status === "INCONCLUSIVE") return "verdict";
  return "base";
}

export function JudgeArt({
  persona,
  expression = "base",
  className = "h-40 w-40",
}: {
  persona: string;
  expression?: JudgeExpression;
  className?: string;
}) {
  const name = JUDGES.includes(persona as (typeof JUDGES)[number]) ? persona : "direct";
  const src = expression === "base" ? `/judges/${name}.svg` : `/judges/${name}-${expression}.svg`;
  return <img src={src} alt="" className={`${className} object-contain`} />;
}

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return <img src="/brand/mark.svg" alt="" className={className} />;
}

export function Stamp() {
  return <img src="/brand/verdict-stamp.svg" alt="가상 판결, 재미용" className="h-24 w-24 -rotate-6" />;
}
