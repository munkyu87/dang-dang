import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function kstDay(timestamp = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

export function kstDayStart(timestamp = Date.now()) {
  const day = kstDay(timestamp);
  return new Date(`${day}T00:00:00+09:00`).getTime();
}

export function formatKst(timestamp: number) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function sourceLabel(mode: "DUAL" | "SOLO", sources?: { B: string }) {
  if (mode === "SOLO") return "단독 진술 · 상대 미확인";
  if (sources?.B === "DIRECT") return "양측 직접 진술";
  return "함께 재판";
}
