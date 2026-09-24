import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CategoryMark } from "@/components/home/category-mark";
import { formatDateKo } from "@/lib/utils";
import type { PostMeta } from "@/types/post";

/** 목차 한 줄 같은 글 행 — 홈과 글 목록에서 함께 사용 */
export function PostRow({ post, activeTag }: { post: PostMeta; activeTag?: string | null }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 py-7 md:grid-cols-[9rem_1fr_11rem] md:py-8"
    >
      <time dateTime={post.date} className="meta order-2 col-span-2 text-sm md:order-none md:col-span-1 md:pt-1.5">
        {formatDateKo(post.date)}
      </time>

      <div className="min-w-0">
        <h3 className="font-serif text-[1.35rem] font-normal leading-snug text-ink transition-colors duration-500 group-hover:text-accent sm:text-[1.5rem]">
          <span className="ink-link">{post.title}</span>
        </h3>
        <p className="mt-2 line-clamp-2 max-w-[38rem] text-[0.95rem] leading-relaxed text-muted">{post.description}</p>
        {activeTag !== undefined && (
          <p className="mt-3 text-xs text-muted">
            {post.tags.map((t, i) => (
              <span key={t}>
                <span className={t === activeTag ? "rounded-sm bg-marker/70 px-1 text-ink" : undefined}>{t}</span>
                {i < post.tags.length - 1 && <span className="mx-1.5 text-faint">·</span>}
              </span>
            ))}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1.5 text-right md:pt-2">
        <CategoryMark id={post.category} />
        <span className="inline-flex items-center gap-1 font-serif text-sm italic text-muted">
          {post.readingTime.minutes}분
          <ArrowUpRight
            className="size-3.5 -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
            strokeWidth={1.5}
          />
        </span>
      </div>
    </Link>
  );
}
