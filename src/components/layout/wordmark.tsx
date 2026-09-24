import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/** 세리프 워드마크 — "Tech" 는 바로, "log" 는 이탤릭으로 흘려 씁니다. */
export function Wordmark({ className, withTagline = true }: { className?: string; withTagline?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-baseline gap-3", className)} aria-label={`${siteConfig.name} 홈`}>
      <span className="font-serif text-[1.45rem] leading-none tracking-[-0.02em] text-ink">
        Tech<em className="font-light italic text-accent transition-colors duration-500 group-hover:text-ink">log</em>
        <span className="text-accent">.</span>
      </span>
      {withTagline && (
        <span className="hidden font-serif text-[0.95rem] italic text-muted md:inline">{siteConfig.tagline}</span>
      )}
    </Link>
  );
}
