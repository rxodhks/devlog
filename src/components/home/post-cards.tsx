"use client";

import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

import { BentoCard } from "@/components/home/bento-card";
import { DifficultyTag } from "@/components/post/difficulty-tag";
import { categories, categoryClasses } from "@/lib/site";
import { cn, formatDate } from "@/lib/utils";
import type { PostMeta } from "@/types/post";

function CategoryPill({ post }: { post: PostMeta }) {
  const cls = categoryClasses[post.category];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", cls.border, cls.softBg, cls.text)}>
      <span className={cn("size-1.5 rounded-full", cls.dot)} />
      {categories[post.category].label}
    </span>
  );
}

/** 대표 글: 코드 스니펫 미리보기가 있는 큰 카드 */
export function FeaturedPostCard({
  post,
  snippet,
  filename,
  outline,
  index,
}: {
  post: PostMeta;
  snippet: React.ReactNode;
  filename: string;
  /** 글의 h2 목차 (카드 하단 "In this post") */
  outline: string[];
  index: number;
}) {
  return (
    <BentoCard index={index} className="md:col-span-2 lg:row-span-2">
      <Link href={`/posts/${post.slug}`} className="flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="eyebrow">Featured</span>
            <CategoryPill post={post} />
          </div>
          <ArrowUpRight className="size-5 text-muted transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-primary" />
        </div>

        <h3 className="mt-5 text-balance text-2xl font-bold leading-snug tracking-tight sm:text-[1.7rem]">{post.title}</h3>
        <p className="mt-3 line-clamp-2 text-pretty leading-relaxed text-muted">{post.description}</p>

        {/* 에디터 느낌의 코드 미리보기 */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-[rgb(var(--code-bg))]">
          <div className="flex items-center gap-1.5 border-b border-border bg-[rgb(var(--code-header))] px-3 py-2">
            <span className="size-2.5 rounded-full bg-[#FF5F57]" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="size-2.5 rounded-full bg-[#28C840]" />
            <span className="ml-2 font-mono text-[11px] text-muted">{filename}</span>
          </div>
          <pre className="overflow-hidden px-4 py-3 font-mono text-[12.5px] leading-[1.75]">{snippet}</pre>
        </div>

        {outline.length > 0 && (
          <div className="mt-5">
            <p className="eyebrow mb-2">In this post</p>
            <ol className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
              {outline.slice(0, 6).map((h, i) => (
                <li key={h} className="flex min-w-0 items-baseline gap-2 text-muted transition-colors group-hover/card:text-foreground/80">
                  <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate">{h}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {post.readingTime.minutes} min
          </span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <DifficultyTag difficulty={post.difficulty} />
          <span className="hidden gap-2 font-mono sm:flex">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </span>
        </div>
      </Link>
    </BentoCard>
  );
}

/** 작은 포스트 카드 */
export function PostMiniCard({ post, index, visual }: { post: PostMeta; index: number; visual?: React.ReactNode }) {
  return (
    <BentoCard index={index}>
      <Link href={`/posts/${post.slug}`} className="flex h-full min-h-[220px] flex-col p-5">
        <div className="flex items-center justify-between">
          <CategoryPill post={post} />
          <ArrowUpRight className="size-4 text-muted transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-primary" />
        </div>
        {visual && <div className="mt-4">{visual}</div>}
        <h3 className="mt-4 line-clamp-3 text-[1.05rem] font-semibold leading-snug tracking-tight">{post.title}</h3>
        <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {post.readingTime.minutes} min
          </span>
          <DifficultyTag difficulty={post.difficulty} />
        </div>
      </Link>
    </BentoCard>
  );
}
