"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { PostRow } from "@/components/posts/post-row";
import { categories, categoryClasses, categoryList } from "@/lib/site";
import { cn } from "@/lib/utils";
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

  const filterButton = (active: boolean) =>
    cn(
      "relative pb-1 text-[0.95rem] transition-colors duration-300",
      active ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-ink" : "text-muted hover:text-ink",
    );

  return (
    <div>
      {/* ── 고르기 ── */}
      <div className="space-y-6 border-b border-rule pb-8">
        <label className="block max-w-md">
          <span className="sr-only">글 찾기</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목이나 낱말로 찾아보기"
            className="w-full border-b border-muted/70 bg-transparent pb-2 font-serif text-lg italic text-ink outline-none transition-colors placeholder:text-muted focus:border-ink"
          />
        </label>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <button onClick={() => setParam("category", null)} className={filterButton(!category)}>
            전체
          </button>
          {categoryList.map((c) => (
            <button key={c.id} onClick={() => setParam("category", c.id)} className={cn(filterButton(category === c.id), "inline-flex items-center gap-2")}>
              <span className={cn("size-[6px] rounded-full", categoryClasses[c.id].dot)} aria-hidden />
              {c.name}
            </button>
          ))}
        </div>

        <p className="text-sm leading-[2.1] text-muted">
          <span className="meta mr-3 text-sm">낱말</span>
          {tags.map((t, i) => (
            <React.Fragment key={t.tag}>
            <span className="whitespace-nowrap">
              <button
                onClick={() => setParam("tag", t.tag)}
                className={cn(
                  "rounded-sm transition-colors",
                  tag === t.tag ? "bg-marker/70 px-1 text-ink" : "hover:text-ink",
                )}
              >
                {t.tag}
              </button>
              {i < tags.length - 1 && <span className="ml-1.5 text-faint">·</span>}
            </span>{" "}
            </React.Fragment>
          ))}
        </p>

        <AnimatePresence>
          {(category || tag) && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="font-serif italic text-muted"
            >
              {category && <>{categories[category]?.name} </>}
              {tag && <>‘{tag}’ </>}
              글만 보고 있어요.{" "}
              <button
                onClick={() => router.replace(pathname, { scroll: false })}
                className="ink-link not-italic text-ink"
              >
                모두 보기
              </button>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── 목록 ── */}
      <ol>
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((post) => (
            <motion.li
              key={post.slug}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="border-b border-rule"
            >
              <PostRow post={post} activeTag={tag} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      {filtered.length === 0 && (
        <p className="py-24 text-center font-serif text-lg italic text-muted">아직 그런 글은 없어요. 다른 낱말로 찾아볼까요?</p>
      )}
    </div>
  );
}
