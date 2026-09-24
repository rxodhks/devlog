"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Crosshair, FileText, Hash, Layers, MousePointerClick, Search } from "lucide-react";

import { KnowledgeGraph } from "@/components/graph/knowledge-graph";
import { hrefForNode, type GraphNode, type KnowledgeGraphData } from "@/lib/graph";
import { categories, categoryClasses, categoryList } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { CategoryId, PostMeta } from "@/types/post";

const KIND_META = {
  category: { label: "Category", icon: Layers },
  tag: { label: "Tag", icon: Hash },
  post: { label: "Post", icon: FileText },
} as const;

export function GraphExplorer({ data, posts }: { data: KnowledgeGraphData; posts: PostMeta[] }) {
  const [selected, setSelected] = React.useState<GraphNode | null>(null);
  const [hidden, setHidden] = React.useState<Set<CategoryId>>(new Set());
  const [query, setQuery] = React.useState("");

  const postBySlug = React.useMemo(() => new Map(posts.map((p) => [p.slug, p])), [posts]);

  const neighbors = React.useMemo(() => {
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

  const stats = {
    category: data.nodes.filter((n) => n.kind === "category").length,
    tag: data.nodes.filter((n) => n.kind === "tag").length,
    post: data.nodes.filter((n) => n.kind === "post").length,
    links: data.links.length,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* ── Canvas ── */}
      <div className="surface-card relative h-[68vh] min-h-[480px]">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:32px_32px] opacity-50 [mask-image:radial-gradient(circle_at_center,#000_40%,transparent_85%)]" />
        <KnowledgeGraph
          data={data}
          variant="full"
          selectedId={selected?.id ?? null}
          hiddenCategories={hidden}
          onSelect={setSelected}
        />

        {/* 검색 */}
        <div className="absolute left-4 top-4 z-10 w-[min(280px,calc(100%-2rem))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="노드 검색 (예: SQL)"
              className="h-9 w-full rounded-xl border border-border bg-surface/90 pl-9 pr-3 text-sm shadow-card outline-none backdrop-blur-md focus:border-primary/50"
            />
          </label>
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1.5 overflow-hidden rounded-xl border border-border bg-surface/95 py-1 shadow-xl backdrop-blur-md"
              >
                {suggestions.map((n) => {
                  const Icon = KIND_META[n.kind].icon;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => {
                          setSelected(n);
                          setQuery("");
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-surface-muted"
                      >
                        <Icon className={cn("size-3.5", n.category && categoryClasses[n.category].text)} />
                        <span className="truncate">{n.label}</span>
                        <span className="ml-auto font-mono text-[10px] text-muted">{n.kind}</span>
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* 범례 + 카테고리 토글 */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center gap-1.5">
          {categoryList.map((c) => {
            const off = hidden.has(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCategory(c.id)}
                aria-pressed={!off}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border bg-surface/90 px-2.5 py-1 text-xs backdrop-blur-md transition-opacity",
                  categoryClasses[c.id].border,
                  off && "opacity-40",
                )}
              >
                <span className={cn("size-2 rounded-full", categoryClasses[c.id].bg)} />
                {c.short}
              </button>
            );
          })}
          <span className="ml-auto hidden items-center gap-3 rounded-full border border-border bg-surface/90 px-3 py-1 text-[11px] text-muted backdrop-blur-md sm:inline-flex">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-muted" /> post
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full border border-muted" /> tag
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 border-t border-dashed border-muted" /> related
            </span>
          </span>
        </div>
      </div>

      {/* ── Side panel ── */}
      <aside className="surface-card p-5">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow flex items-center gap-1.5">
                  {React.createElement(KIND_META[selected.kind].icon, { className: "size-3.5 text-primary" })}
                  {KIND_META[selected.kind].label}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-muted transition-colors hover:text-foreground"
                >
                  선택 해제
                </button>
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight">
                {selected.kind === "tag" ? `#${selected.label}` : selected.label}
              </h2>
              {selected.category && (
                <p className={cn("mt-1 text-sm", categoryClasses[selected.category].text)}>
                  {categories[selected.category].label}
                </p>
              )}
              {selected.kind === "category" && selected.category && (
                <p className="mt-2 text-sm leading-relaxed text-muted">{categories[selected.category].description}</p>
              )}

              <Link
                href={hrefForNode(selected)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-gradient py-2 text-sm font-medium text-white shadow-glow transition hover:brightness-110"
              >
                관련 글 {selected.posts.length}편 보기 <ArrowUpRight className="size-4" />
              </Link>

              <p className="eyebrow mb-2 mt-6">Connected posts</p>
              <ul className="space-y-2">
                {selected.posts.map((slug) => {
                  const post = postBySlug.get(slug);
                  if (!post) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={`/posts/${slug}`}
                        className="group flex items-start gap-2.5 rounded-xl border border-border bg-surface-muted/40 p-3 transition-colors hover:border-primary/40"
                      >
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", categoryClasses[post.category].dot)} />
                        <span className="min-w-0">
                          <span className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                            {post.title}
                          </span>
                          <span className="mt-1 block font-mono text-[11px] text-muted">
                            {post.readingTime.minutes} min · {post.difficulty}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {neighbors.length > 0 && (
                <>
                  <p className="eyebrow mb-2 mt-6">Linked tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {neighbors.map((n) => (
                      <button key={n.id} onClick={() => setSelected(n)} className="chip hover:border-primary/40">
                        #{n.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="eyebrow flex items-center gap-1.5">
                <Crosshair className="size-3.5 text-primary" /> Explore
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-tight">노드를 선택해 보세요</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-muted">
                <li className="flex gap-2">
                  <MousePointerClick className="mt-0.5 size-4 shrink-0 text-primary" />
                  카테고리·태그 노드를 클릭하면 연결된 글이 이 패널에 나타납니다.
                </li>
                <li className="flex gap-2">
                  <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                  포스트 노드를 클릭하면 바로 글로 이동합니다.
                </li>
                <li className="flex gap-2">
                  <Search className="mt-0.5 size-4 shrink-0 text-primary" />
                  휠로 확대/축소, 드래그로 이동, 노드를 끌어 배치를 바꿀 수 있어요.
                </li>
              </ul>
              <dl className="mt-6 grid grid-cols-2 gap-2">
                {[
                  { k: "Categories", v: stats.category },
                  { k: "Tags", v: stats.tag },
                  { k: "Posts", v: stats.post },
                  { k: "Links", v: stats.links },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-surface-muted/60 px-3 py-2.5">
                    <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted">{s.k}</dt>
                    <dd className="mt-0.5 text-xl font-bold tabular-nums">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}
