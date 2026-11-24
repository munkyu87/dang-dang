export const CATEGORIES = ["연애", "부부", "친구", "가족", "룸메이트", "직장", "기타"] as const;

export type Category = (typeof CATEGORIES)[number];

export const LIMITS = {
  title: 50,
  summary: 300,
  statement: 2000,
  answer: 500,
} as const;

export const PROMPT_VERSION = "v2.1-mock-1";

export const DAY_MS = 24 * 60 * 60 * 1000;

export const SAFETY_HELP =
  "이 내용은 재미로 판결하기 어렵습니다. 긴급하면 112, 여성긴급전화 1366, 자살예방 상담 109로 연락해 주세요.";
