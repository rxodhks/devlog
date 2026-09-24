"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, Search, X } from "lucide-react";

import { DifficultyTag } from "@/components/post/difficulty-tag";
import { categories, categoryClasses, categoryList } from "@/lib/site";
import { cn, formatDate } from "@/lib/utils";
import type { CategoryId, PostMeta } from "@/types/post";

export function PostExplorer({ posts, tags }: { posts: PostMeta[]; tags: { tag: string; count: number }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const category = params.get("category") as CategoryId | null;
  const tag = params.get("tag");
  const [query, setQuery] = React.useState("");

  const setParam = (key: "category" | "tag", value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const q = query.trim().toLowerCase();
  const filtered = posts.filter(
    (p) =>
      (!category || p.category === category) &&
      (!tag || p.tags.includes(tag)) &&
      (!q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))),
  );

  return (
    <div>
      {/* ── Filters ── */}
      <div className="sticky top-16 z-20 -mx-4 mb-8 space-y-3 border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목, 설명, 태그로 검색…"
              className="h-10 w-full rounded-xl border border-border bg-surface/80 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-primary/50"
            />
          </label>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setParam("category", null)}
              className={cn("chip shrink-0", !category && "border-primary/40 bg-primary/10 text-primary")}
            >
              All
            </button>
            {categoryList.map((c) => (
              <button
                key={c.id}
                onClick={() => setParam("category", c.id)}
                className={cn(
                  "chip shrink-0",
                  category === c.id && cn(categoryClasses[c.id].border, categoryClasses[c.id].softBg, categoryClasses[c.id].text),
                )}
              >
                <span className={cn("size-1.5 rounded-full", categoryClasses[c.id].bg)} />
                {c.short}
              </button>
            ))}
          </div>
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {tags.map((t) => (
            <button
              key={t.tag}
              onClick={() => setParam("tag", t.tag)}
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] transition-colors",
                tag === t.tag ? "bg-primary text-white" : "bg-surface-muted text-muted hover:text-foreground",
              )}
            >
              #{t.tag}
            </button>
          ))}
        </div>
        {(category || tag) && (
          <div className="flex items-center gap-2 text-xs text-muted">
            필터:
            {category && (
              <button onClick={() => setParam("category", null)} className="chip py-0.5">
                {categories[category]?.label} <X className="size-3" />
              </button>
            )}
            {tag && (
              <button onClick={() => setParam("tag", null)} className="chip py-0.5">
                #{tag} <X className="size-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── List ── */}
      <motion.ul layout className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((post) => {
            const cls = categoryClasses[post.category];
            return (
              <motion.li
                key={post.slug}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <Link
                  href={`/posts/${post.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-border bg-surface/70 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", cls.text)}>
                      <span className={cn("size-1.5 rounded-full", cls.dot)} />
                      {categories[post.category].label}
                    </span>
                    <ArrowUpRight className="size-4 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <h2 className="mt-3 text-lg font-bold leading-snug tracking-tight">{post.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{post.description}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-5 text-xs text-muted">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" /> {post.readingTime.minutes} min
                    </span>
                    <DifficultyTag difficulty={post.difficulty} />
                    <span className="flex flex-wrap gap-1.5 font-mono">
                      {post.tags.slice(0, 3).map((t) => (
                        <span key={t} className={cn(t === tag && "text-primary")}>
                          #{t}
                        </span>
                      ))}
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      {filtered.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center text-muted">
          <p className="font-mono text-sm">0 rows returned</p>
          <p className="mt-1 text-sm">조건에 맞는 글이 없어요. 필터를 조정해 보세요.</p>
        </div>
      )}
    </div>
  );
}
