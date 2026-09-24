"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Boxes } from "lucide-react";

import { BentoCard, CardHeader } from "@/components/home/bento-card";
import { categoryClasses, categoryList } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/post";

const TECH_STACK = ["Java", "Spring Boot", "React", "Next.js", "TypeScript", "Oracle", "PostgreSQL", "Python", "Linux", "Docker", "Git"];

export function CategoriesCard({
  counts,
  tags,
  index,
}: {
  counts: Record<CategoryId, number>;
  tags: { tag: string; count: number }[];
  index: number;
}) {
  const max = Math.max(...Object.values(counts), 1);

  return (
    <BentoCard index={index} className="p-6 md:col-span-2">
      <CardHeader icon={Boxes} eyebrow="Categories & Stack" />

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {categoryList.map((c) => {
          const cls = categoryClasses[c.id];
          return (
            <Link
              key={c.id}
              href={`/posts?category=${c.id}`}
              className={cn(
                "group/cat relative overflow-hidden rounded-2xl border bg-surface-muted/40 p-3 transition-colors hover:bg-surface-muted",
                cls.border,
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("font-mono text-xs font-bold", cls.text)}>{c.short}</span>
                <span className="font-mono text-xs text-muted">{counts[c.id] ?? 0}</span>
              </div>
              <p className="mt-1.5 truncate text-[13px] font-medium">{c.label}</p>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-border/70">
                <motion.div
                  className={cn("h-full rounded-full", cls.bg)}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${((counts[c.id] ?? 0) / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.slice(0, 8).map((t) => (
          <Link
            key={t.tag}
            href={`/posts?tag=${encodeURIComponent(t.tag)}`}
            className="chip hover:border-primary/40 hover:text-foreground"
          >
            <span className="text-primary">#</span>
            {t.tag}
            <span className="font-mono text-[10px] text-muted">{t.count}</span>
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/70 pt-3">
        {TECH_STACK.map((s) => (
          <span key={s} className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-[11px] text-muted">
            {s}
          </span>
        ))}
      </div>
    </BentoCard>
  );
}
