"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { KnowledgeGraph } from "@/components/graph/knowledge-graph";
import { hrefForNode, type GraphNode, type KnowledgeGraphData } from "@/lib/graph";
import { categories, categoryClasses, categoryList } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { CategoryId, PostMeta } from "@/types/post";

const KIND_LABEL = { category: "주제", tag: "낱말", post: "글" } as const;

export function GraphExplorer({ data, posts }: { data: KnowledgeGraphData; posts: PostMeta[] }) {
  const [selected, setSelected] = React.useState<GraphNode | null>(null);
  const [hidden, setHidden] = React.useState<Set<CategoryId>>(new Set());
  const [query, setQuery] = React.useState("");

  const postBySlug = React.useMemo(() => new Map(posts.map((p) => [p.slug, p])), [posts]);

  const neighborTags = React.useMemo(() => {
    if (!selected) return [];
    const ids = new Set<string>();
    for (const l of data.links) {
      if (l.source === selected.id) ids.add(l.target);
      if (l.target === selected.id) ids.add(l.source);
    }
    return data.nodes.filter((n) => ids.has(n.id) && n.kind === "tag");
  }, [selected, data]);

  const suggestions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return data.nodes.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query, data]);

  const toggleCategory = (id: CategoryId) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const count = (kind: GraphNode["kind"]) => data.nodes.filter((n) => n.kind === kind).length;

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
      {/* ── 그림 ── */}
      <figure className="min-w-0">
        <div className="relative h-[64vh] min-h-[460px] border-y border-rule">
          <KnowledgeGraph
            data={data}
            variant="full"
            selectedId={selected?.id ?? null}
            hiddenCategories={hidden}
            onSelect={setSelected}
          />

          {/* 찾기 */}
          <div className="absolute left-0 top-4 z-10 w-[min(260px,calc(100%-1rem))]">
            <label className="block">
              <span className="sr-only">점 찾기</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="점 찾기 — 예: SQL"
                className="w-full border-b border-muted/70 bg-paper/80 pb-1.5 font-serif italic text-ink outline-none backdrop-blur-sm placeholder:text-muted focus:border-ink"
              />
            </label>
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 rounded-lg border border-rule bg-paper-raised py-1 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]"
                >
                  {suggestions.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => {
                          setSelected(n);
                          setQuery("");
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm text-ink-soft hover:bg-paper-deep hover:text-ink"
                      >
                        <span className={cn("size-[6px] shrink-0 rounded-full", n.category ? categoryClasses[n.category].dot : "bg-faint")} />
                        <span className="truncate">{n.kind === "tag" ? `#${n.label}` : n.label}</span>
                        <span className="ml-auto font-serif text-xs italic text-muted">{KIND_LABEL[n.kind]}</span>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 text-sm">
          <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {categoryList.map((c) => {
              const off = hidden.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  aria-pressed={!off}
                  className={cn("inline-flex items-center gap-2 transition-opacity duration-300", off ? "text-muted opacity-50 line-through" : "text-ink-soft")}
                >
                  <span className={cn("size-[7px] rounded-full", categoryClasses[c.id].dot)} />
                  {c.name}
                </button>
              );
            })}
          </span>
          <span className="font-serif italic text-muted">
            ● 글 &nbsp; ○ 낱말 &nbsp; ┈ 서로 이어 읽으면 좋은 글
          </span>
        </figcaption>
      </figure>

      {/* ── 여백 ── */}
      <aside className="lg:pt-2">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="meta text-sm">{KIND_LABEL[selected.kind]}</p>
              <h2 className="mt-2 font-serif text-[1.7rem] font-light leading-snug text-ink">
                {selected.kind === "tag" ? `#${selected.label}` : selected.label}
              </h2>
              {selected.kind === "category" && selected.category && (
                <p className="mt-3 text-sm leading-relaxed text-muted">{categories[selected.category].description}</p>
              )}

              <p className="meta mb-2 mt-8 text-sm">이어진 글 {selected.posts.length}편</p>
              <ul>
                {selected.posts.map((slug) => {
                  const post = postBySlug.get(slug);
                  if (!post) return null;
                  return (
                    <li key={slug} className="border-t border-rule first:border-t-0">
                      <Link href={`/posts/${slug}`} className="group block py-3">
                        <span className="font-serif leading-snug text-ink transition-colors duration-500 group-hover:text-accent">
                          <span className="ink-link">{post.title}</span>
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-muted">
                          <span className={cn("size-[6px] rounded-full", categoryClasses[post.category].dot)} />
                          {categories[post.category].name} · {post.readingTime.minutes}분
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {neighborTags.length > 0 && (
                <p className="mt-6 text-sm leading-[2] text-muted">
                  <span className="meta mr-2 text-sm">함께 걸린 낱말</span>
                  {neighborTags.map((n, i) => (
                    <span key={n.id}>
                      <button onClick={() => setSelected(n)} className="ink-link text-ink-soft hover:text-ink">
                        {n.label}
                      </button>
                      {i < neighborTags.length - 1 && <span className="mx-1.5 text-faint">·</span>}
                    </span>
                  ))}
                </p>
              )}

              <div className="mt-8 flex gap-6 text-sm">
                <Link href={hrefForNode(selected)} className="group inline-flex items-center gap-1.5 text-ink">
                  <span className="ink-link">목록에서 보기</span>
                  <ArrowRight className="size-3.5 text-accent transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
                </Link>
                <button onClick={() => setSelected(null)} className="ink-link text-muted hover:text-ink">
                  놓아주기
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="meta text-sm">읽는 법</p>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
                <li className="flex gap-3">
                  <span className="font-serif italic text-accent">i.</span>
                  주제나 낱말(속이 빈 점)을 누르면, 이어진 글이 여기 적혀요.
                </li>
                <li className="flex gap-3">
                  <span className="font-serif italic text-accent">ii.</span>
                  글(속이 찬 점)을 누르면 바로 그 글로 넘어가요.
                </li>
                <li className="flex gap-3">
                  <span className="font-serif italic text-accent">iii.</span>
                  휠로 가까이 보고, 끌어서 옮기고, 점을 집어 자리를 바꿀 수 있어요.
                </li>
              </ol>
              <p className="mt-10 font-serif text-[1.15rem] font-light leading-relaxed text-ink">
                지금 주제 {count("category")}개, 글 {count("post")}편, 낱말 {count("tag")}개가 {data.links.length}개의 선으로 이어져 있어요.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}
