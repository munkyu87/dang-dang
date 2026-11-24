import { CLASSIFY_SYSTEM, JUDGE_SYSTEM } from "@/lib/ai/prompt";
import { classifySchema, verdictSchema, type AiResult, type AiUsage, type ClassifyResult, type VerdictDraft } from "@/lib/ai/schema";
import { mockClassify, mockJudge, type ClassifyInput, type JudgeInput } from "@/lib/ai/mock";
import { AppError } from "@/lib/errors";

export type AiProvider = {
  classify(input: ClassifyInput): Promise<AiResult<ClassifyResult>>;
  judge(input: JudgeInput): Promise<AiResult<VerdictDraft>>;
};

const mockProvider: AiProvider = {
  async classify(input) {
    return mockClassify(input);
  },
  async judge(input) {
    return mockJudge(input);
  },
};

async function openAiJson(system: string, payload: unknown): Promise<{ text: string; usage: AiUsage }> {
  const key = process.env.AI_API_KEY;
  if (!key) throw new AppError(503, "AI_UNAVAILABLE", "AI 설정이 없습니다.");
  const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });
  if (!response.ok) throw new AppError(503, "AI_UNAVAILABLE", "AI 응답을 받지 못했습니다.");
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new AppError(503, "AI_UNAVAILABLE", "AI 응답이 비어 있습니다.");
  const inputTokens = data.usage?.prompt_tokens ?? 0;
  const outputTokens = data.usage?.completion_tokens ?? 0;
  const costKrw = Math.max(1, Math.round((inputTokens / 1000) * 2 + (outputTokens / 1000) * 8));
  return { text, usage: { model, inputTokens, outputTokens, costKrw } };
}

const openAiProvider: AiProvider = {
  async classify(input) {
    const { personaKey: _persona, ...safe } = input as JudgeInput;
    const result = await openAiJson(CLASSIFY_SYSTEM, safe);
    return { data: classifySchema.parse(JSON.parse(result.text)), usage: result.usage };
  },
  async judge(input) {
    const { personaKey: _persona, ...safe } = input;
    const result = await openAiJson(JUDGE_SYSTEM, safe);
    return { data: verdictSchema.parse(JSON.parse(result.text)), usage: result.usage };
  },
};

export function getProvider(): AiProvider {
  return process.env.AI_PROVIDER === "openai" ? openAiProvider : mockProvider;
}
