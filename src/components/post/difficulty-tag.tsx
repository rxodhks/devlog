import { difficultyMeta } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types/post";

export function DifficultyTag({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const meta = difficultyMeta[difficulty];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider",
        meta.className,
        className,
      )}
      title={`난이도: ${meta.label}`}
    >
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3].map((lvl) => (
          <span
            key={lvl}
            className={cn("w-[3px] rounded-full bg-current", lvl <= meta.level ? "opacity-100" : "opacity-25")}
            style={{ height: 4 + lvl * 3 }}
          />
        ))}
      </span>
      {meta.label}
    </span>
  );
}
