import { difficultyMeta } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types/post";

/** 난이도 — 점 세 개 중 몇 개가 채워졌는지 + 이탤릭 라벨 */
export function DifficultyTag({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const meta = difficultyMeta[difficulty];
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted", className)} title={`난이도 ${meta.label}`}>
      <span className="flex items-center gap-[3px]" aria-hidden>
        {[1, 2, 3].map((lvl) => (
          <span
            key={lvl}
            className={cn("size-[5px] rounded-full", lvl <= meta.level ? "bg-ink-soft" : "border border-rule-strong")}
          />
        ))}
      </span>
      <span className="font-serif italic">{meta.label}</span>
      <span className="sr-only">난이도</span>
    </span>
  );
}
