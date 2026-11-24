const JUDGE_SRC: Record<string, string> = {
  principle: "/judges/principle.svg",
  mediator: "/judges/mediator.svg",
  direct: "/judges/direct.svg",
  humor: "/judges/humor.svg",
  satto: "/judges/satto.svg",
};

export function JudgeArt({ persona, className = "h-40 w-40" }: { persona: string; className?: string }) {
  const src = JUDGE_SRC[persona] ?? JUDGE_SRC.direct;
  return <img src={src} alt="" className={`${className} object-contain`} />;
}

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return <img src="/brand/mark.svg" alt="" className={className} />;
}

export function Stamp() {
  return <img src="/brand/verdict-stamp.svg" alt="가상 판결, 재미용" className="h-24 w-24 -rotate-6" />;
}
