import type { Metadata } from "next";

import { GraphExplorer } from "@/components/graph/graph-explorer";
import { buildKnowledgeGraph } from "@/lib/graph";
import { getAllPostMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Knowledge Graph",
  description: "카테고리 · 태그 · 포스트 사이의 연결을 인터랙티브 그래프로 탐색합니다.",
};

export default function GraphPage() {
  const posts = getAllPostMeta();
  const data = buildKnowledgeGraph(posts);

  return (
    <div className="container pb-10 pt-10 sm:pt-14">
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow text-primary">MATCH (c)-[:HAS]-&gt;(p)-[:TAGGED]-&gt;(t) RETURN *</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Knowledge Graph</h1>
        <p className="mt-3 leading-relaxed text-muted">
          글은 따로 존재하지 않습니다. <span className="text-foreground">SQL</span> ↔{" "}
          <span className="text-foreground">정규화</span> ↔ <span className="text-foreground">트랜잭션</span>처럼
          개념들이 어떻게 이어지는지 한눈에 보고, 노드를 따라 다음에 읽을 글을 찾아보세요.
        </p>
      </header>
      <GraphExplorer data={data} posts={posts} />
    </div>
  );
}
