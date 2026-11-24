export function JudgeArt({ persona, className = "h-40 w-40" }: { persona: string; className?: string }) {
  const cheeks = persona === "humor" || persona === "mediator";
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label="땅땅 판사">
      <circle cx="100" cy="108" r="78" fill="#FFE34F" stroke="#18171B" strokeWidth="6" />
      {persona === "satto" ? (
        <path d="M38 78h124l-14-28H52z" fill="#18171B" />
      ) : null}
      <circle cx="100" cy="112" r="48" fill="#FFE8C7" stroke="#18171B" strokeWidth="6" />
      {persona === "principle" ? (
        <g fill="none" stroke="#18171B" strokeWidth="4">
          <circle cx="84" cy="112" r="12" />
          <circle cx="116" cy="112" r="12" />
          <path d="M96 112h8" />
        </g>
      ) : (
        <g fill="#18171B">
          <circle cx="84" cy="110" r="5" />
          <circle cx="116" cy="110" r="5" />
        </g>
      )}
      {persona === "direct" ? (
        <path d="M70 96l18 8M130 96l-18 8" stroke="#18171B" strokeWidth="5" strokeLinecap="round" />
      ) : null}
      <path
        d={persona === "humor" || persona === "mediator" ? "M82 128c8 12 28 12 36 0" : "M86 130h28"}
        fill="none"
        stroke="#18171B"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {cheeks ? (
        <g fill="#FF91B8">
          <circle cx="68" cy="124" r="6" />
          <circle cx="132" cy="124" r="6" />
        </g>
      ) : null}
      <path d="M46 168h108l-10 18H58z" fill="#7652F4" stroke="#18171B" strokeWidth="6" />
      <path d="M148 86h28v8h-8v28h-8V94h-12z" fill="#18171B" />
    </svg>
  );
}

export function Stamp() {
  return (
    <div className="grid h-24 w-24 rotate-[-8deg] place-items-center rounded-full border-4 border-danger text-center text-[11px] font-black leading-tight text-danger">
      DDANG!
      <br />
      가상 판결
      <br />
      FOR FUN
    </div>
  );
}
