export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as { data: T; error: { message: string } | null };
  if (!response.ok || body.error) {
    throw new Error(body.error?.message || "요청에 실패했습니다.");
  }
  return body.data;
}
