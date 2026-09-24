import Link from "next/link";

import { categories, categoryClasses } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/post";

/** 카테고리 표식 — 색은 점에만, 글자는 잉크 */
export function CategoryBadge({ category, link = true, className }: { category: CategoryId; link?: boolean; className?: string }) {
  const content = (
    <>
      <span className={cn("size-[7px] shrink-0 rounded-full", categoryClasses[category].dot)} aria-hidden />
      {categories[category].name}
    </>
  );
  const base = cn("inline-flex items-center gap-2 text-sm text-muted", className);
  return link ? (
    <Link href={`/posts?category=${category}`} className={cn(base, "transition-colors hover:text-ink")}>
      {content}
    </Link>
  ) : (
    <span className={base}>{content}</span>
  );
}
