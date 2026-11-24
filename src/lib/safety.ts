const RULES: { code: string; pattern: RegExp }[] = [
  { code: "SELF_HARM", pattern: /자살|자해|죽고\s*싶|죽어버리겠/ },
  { code: "VIOLENCE", pattern: /죽여|죽이자|살인|폭행|칼부림/ },
  { code: "SEXUAL", pattern: /성폭|강간|성추행|몰카/ },
  { code: "ABUSE", pattern: /학대/ },
  { code: "MINOR", pattern: /미성년/ },
  { code: "LEGAL", pattern: /법적\s*처벌|유죄\s*확정|합의금/ },
];

export function detectBlock(text: string) {
  for (const rule of RULES) {
    if (rule.pattern.test(text)) return rule.code;
  }
  return null;
}
