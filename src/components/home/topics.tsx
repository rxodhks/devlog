import * as React from "react";
import Link from "next/link";

import { Reveal } from "@/components/home/reveal";
import { categoryClasses, categoryList } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/post";

/** 책의 차례처럼 — 카테고리 이름 ······ 편 수 */
export function Topics({
  counts,
  tags,
}: {
  counts: Record<CategoryId, number>;
  tags: { tag: string; count: number }[];
}) {
  return (
    <section aria-label="주제">
      <Reveal>
        <p className="section-label">주제</p>
      </Reveal>

      <ul className="mt-8 space-y-6">
        {categoryList.map((c, i) => (
          <Reveal as="li" key={c.id} delay={0.05 * i}>
            <Link href={`/posts?category=${c.id}`} className="group block">
              <span className="leader">
                <span className={cn("size-[7px] shrink-0 -translate-y-[0.2em] rounded-full", categoryClasses[c.id].dot)} aria-hidden />
                <span className="font-serif text-[1.3rem] text-ink transition-colors duration-500 group-hover:text-accent">
                  {c.name}
                </span>
                <span className="font-serif text-sm italic text-muted">{c.label}</span>
                <span className="dots" aria-hidden />
                <span className="font-serif italic text-muted">{counts[c.id] ?? 0}편</span>
              </span>
              <span className="mt-1 block pl-[19px] text-sm leading-relaxed text-muted">{c.description}</span>
            </Link>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={0.2}>
        <p className="meta mt-12 text-sm">자주 쓰는 낱말</p>
        <p className="mt-3 text-[0.95rem] leading-[2] text-ink-soft">
          {tags.slice(0, 14).map((t, i) => (
            <React.Fragment key={t.tag}>
            <span className="whitespace-nowrap">
              <Link href={`/posts?tag=${encodeURIComponent(t.tag)}`} className="ink-link hover:text-ink">
                {t.tag}
              </Link>
              {t.count > 1 && <sup className="ml-0.5 font-serif text-[0.7em] italic text-accent">{t.count}</sup>}
              {i < Math.min(tags.length, 14) - 1 && <span className="ml-2 text-faint">·</span>}
            </span>
            {" "}
            </React.Fragment>
          ))}
        </p>
      </Reveal>
    </section>
  );
}
