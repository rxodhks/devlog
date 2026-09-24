import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CategoryMark } from "@/components/home/category-mark";
import { Reveal } from "@/components/home/reveal";
import { difficultyMeta } from "@/lib/site";
import { formatDateKo, toRoman } from "@/lib/utils";
import type { PostMeta } from "@/types/post";

/** "이번 글" — 잡지의 리드 기사처럼 한 편을 크게 */
export function LeadArticle({
  post,
  outline,
  excerpt,
  excerptLabel,
}: {
  post: PostMeta;
  outline: string[];
  excerpt: React.ReactNode;
  excerptLabel: string;
}) {
  return (
    <section aria-labelledby="lead-title">
      <Reveal>
        <p className="section-label">이번 글</p>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        <Reveal delay={0.1} className="min-w-0 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <CategoryMark id={post.category} />
            <span className="meta text-sm">{formatDateKo(post.date)}</span>
          </div>

          <h2 id="lead-title" className="mt-5 font-serif text-display-2 font-normal text-ink">
            <Link href={`/posts/${post.slug}`} className="ink-link">
              {post.title}
            </Link>
          </h2>
          <p className="mt-5 max-w-[36rem] text-pretty leading-[1.85] text-ink-soft">{post.description}</p>

          {outline.length > 0 && (
            <div className="mt-9">
              <p className="meta mb-3 text-sm">이 글에서 다루는 것</p>
              <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {outline.slice(0, 6).map((h, i) => (
                  <li key={h} className="flex min-w-0 items-baseline gap-3 text-[0.95rem] text-ink-soft">
                    <span className="w-6 shrink-0 text-right font-serif text-sm italic text-accent">{toRoman(i + 1)}</span>
                    <span className="truncate">{h}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <Link
            href={`/posts/${post.slug}`}
            className="group mt-10 inline-flex items-center gap-2 text-[0.95rem] text-ink"
          >
            <span className="ink-link">{post.readingTime.minutes}분 동안 읽기</span>
            <ArrowRight className="size-4 text-accent transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
            <span className="ml-3 font-serif text-sm italic text-muted">{difficultyMeta[post.difficulty].label}</span>
          </Link>
        </Reveal>

        <Reveal delay={0.25} className="min-w-0 lg:col-span-5">
          {post.quote && (
            <blockquote className="relative">
              <span aria-hidden className="absolute -left-2 -top-10 select-none font-serif text-[6rem] leading-none text-rule-strong">
                “
              </span>
              <p className="relative font-serif text-[1.55rem] font-light leading-[1.6] text-ink">{post.quote}</p>
              <footer className="meta mt-4 text-sm">— 본문 중에서</footer>
            </blockquote>
          )}
          <div className="mt-10 border-l border-rule-strong pl-5">
            <p className="meta mb-2 text-sm">{excerptLabel}</p>
            <pre className="overflow-x-auto font-mono text-[12.5px] leading-[1.8] text-ink-soft">{excerpt}</pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
