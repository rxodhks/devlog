"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, MousePointerClick, Waypoints } from "lucide-react";

import { KnowledgeGraph } from "@/components/graph/knowledge-graph";
import { BentoCard, CardHeader } from "@/components/home/bento-card";
import type { GraphNode, KnowledgeGraphData } from "@/lib/graph";
import { categoryList, categoryClasses } from "@/lib/site";
import { cn } from "@/lib/utils";

export function GraphPreviewCard({ data }: { data: KnowledgeGraphData }) {
  const [hovered, setHovered] = React.useState<GraphNode | null>(null);

  return (
    <BentoCard index={1} plain static className="flex min-h-[420px] flex-col md:col-span-2 lg:row-span-2">
      <div className="flex h-full flex-col">
        <CardHeader
          className="p-6 pb-0"
          icon={Waypoints}
          eyebrow="Knowledge Graph"
          title="개념은 서로 연결되어 있다"
          action={
            <Link
              href="/graph"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface/70 px-2.5 py-1 text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Full view <ArrowUpRight className="size-3.5" />
            </Link>
          }
        />

        <div className="relative mt-2 min-h-[300px] flex-1">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:28px_28px] opacity-40 [mask-image:radial-gradient(circle_at_center,#000_30%,transparent_75%)]" />
          <KnowledgeGraph data={data} variant="preview" onHover={setHovered} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-6 py-3 text-xs">
          <AnimatePresence mode="wait" initial={false}>
            {hovered ? (
              <motion.span
                key={hovered.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex min-w-0 items-center gap-2"
              >
                <span className={cn("size-2 shrink-0 rounded-full", hovered.category && categoryClasses[hovered.category].dot)} />
                <span className="truncate font-medium">
                  {hovered.kind === "tag" ? `#${hovered.label}` : hovered.label}
                </span>
                <span className="shrink-0 text-muted">
                  · {hovered.kind} · {hovered.posts.length} post{hovered.posts.length > 1 ? "s" : ""}
                </span>
              </motion.span>
            ) : (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-muted"
              >
                <MousePointerClick className="size-3.5" /> 노드를 클릭하면 관련 글로 이동해요
              </motion.span>
            )}
          </AnimatePresence>
          <div className="hidden items-center gap-3 sm:flex">
            {categoryList.map((c) => (
              <span key={c.id} className="flex items-center gap-1 text-muted">
                <span className={cn("size-1.5 rounded-full", categoryClasses[c.id].bg)} />
                {c.short}
              </span>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
