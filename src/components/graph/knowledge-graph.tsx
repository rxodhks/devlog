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
      <span className="size-1.5 animate-breathe rounded-full bg-accent" />
    </div>
  );
}
