import { categories, categoryClasses } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/post";

/** 카테고리 표식: 색은 작은 점에만, 글자는 잉크 색 (dataviz: text wears text tokens) */
export function CategoryMark({ id, className, lang = "ko" }: { id: CategoryId; className?: string; lang?: "ko" | "en" }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}>
      <span className={cn("size-[7px] shrink-0 rounded-full", categoryClasses[id].dot)} aria-hidden />
      {lang === "ko" ? categories[id].name : categories[id].label}
    </span>
  );
}
