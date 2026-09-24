import type { ReadingTime } from "@/types/post";

const HANGUL = /[ㄱ-ㆎ가-힣]/g;
const LATIN_WORD = /[A-Za-z0-9_]+(?:['’-][A-Za-z0-9_]+)*/g;

/**
 * 한/영 혼합 기술 문서용 읽기 시간 추정.
 * - 한글: 분당 약 500자
 * - 영문/숫자: 분당 약 220단어
 * - 코드: 분당 약 40줄 (코드는 천천히 읽는다)
 */
export function estimateReadingTime(source: string): ReadingTime {
  let codeLines = 0;
  const prose = source.replace(/```[\s\S]*?```/g, (block) => {
    codeLines += Math.max(0, block.split("\n").length - 2);
    return " ";
  });

  const hangul = prose.match(HANGUL)?.length ?? 0;
  const latin = prose.replace(HANGUL, " ").match(LATIN_WORD)?.length ?? 0;

  const minutes = hangul / 500 + latin / 220 + codeLines / 40;
  return {
    minutes: Math.max(1, Math.round(minutes)),
    words: Math.round(hangul / 2.6) + latin, // 한글 평균 어절 길이 ≈ 2.6자
    codeLines,
  };
}
