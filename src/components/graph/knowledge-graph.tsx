"use client";

import dynamic from "next/dynamic";

import type { KnowledgeGraphCanvasProps } from "@/components/graph/knowledge-graph-canvas";

/** 캔버스 기반 force-graph 는 window 에 의존하므로 클라이언트에서만 로드합니다. */
const KnowledgeGraphCanvas = dynamic(() => import("@/components/graph/knowledge-graph-canvas"), {
  ssr: false,
  loading: () => <GraphSkeleton />,
});

export function KnowledgeGraph(props: KnowledgeGraphCanvasProps) {
  return <KnowledgeGraphCanvas {...props} />;
}

function GraphSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative size-24">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inset-0 m-auto size-3 animate-pulse-ring rounded-full bg-primary/60"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
        <span className="absolute inset-0 m-auto size-3 rounded-full bg-primary" />
      </div>
    </div>
  );
}
