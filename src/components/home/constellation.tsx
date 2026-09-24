"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { KnowledgeGraph } from "@/components/graph/knowledge-graph";
import type { GraphNode, KnowledgeGraphData } from "@/lib/graph";

/** 상자 없이 종이 위에 떠 있는 작은 별자리 — 홈의 지식 그래프 미리보기 */
export function Constellation({ data }: { data: KnowledgeGraphData }) {
  const [hovered, setHovered] = React.useState<GraphNode | null>(null);

  return (
    <figure className="relative">
      <div className="relative h-[340px] sm:h-[400px] lg:h-[440px]">
        <div
          className="absolute inset-0 mask-radial"
          role="img"
          aria-label="주제, 글, 낱말이 선으로 이어진 지식 그래프. 같은 내용을 아래 글 목록과 '크게 보기' 페이지에서도 볼 수 있어요."
        >
          <KnowledgeGraph data={data} variant="preview" onHover={setHovered} />
        </div>
      </div>
      <figcaption className="-mt-2 flex items-baseline justify-between gap-4 text-sm">
        <span className="meta min-h-[1.5em] text-sm">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={hovered?.id ?? "hint"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {hovered
                ? `${hovered.kind === "tag" ? "#" : ""}${hovered.label} — 글 ${hovered.posts.length}편과 이어져 있어요`
                : "그림 1. 글과 개념이 이어진 모양. 점을 누르면 따라갈 수 있어요."}
            </motion.span>
          </AnimatePresence>
        </span>
        <Link href="/graph" className="ink-link shrink-0 text-muted hover:text-ink">
          크게 보기
        </Link>
      </figcaption>
    </figure>
  );
}
