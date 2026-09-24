import Link from "next/link";

import { categories, categoryClasses } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/post";

export function CategoryBadge({ category, link = true, className }: { category: CategoryId; link?: boolean; className?: string }) {
  const info = categories[category];
  const cls = categoryClasses[category];
  const content = (
    <>
      <span className={cn("size-1.5 rounded-full", cls.dot)} />
      {info.label}
    </>
  );
  const base = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
    cls.border,
    cls.softBg,
    cls.text,
    className,
  );
  return link ? (
    <Link href={`/posts?category=${category}`} className={cn(base, "transition-opacity hover:opacity-80")}>
      {content}
    </Link>
  ) : (
    <span className={base}>{content}</span>
  );
}
