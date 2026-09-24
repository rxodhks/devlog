import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui 스타일 className 병합 유틸 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 2026-09-23 → 2026. 09. 23 */
export function formatDate(input: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  const date = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
    ...opts,
  }).format(date);
}

/** 결정적(seeded) 난수 — SSR/CSR 하이드레이션 불일치 없이 목업 데이터를 만들 때 사용 */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
