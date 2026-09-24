import type { Metadata } from "next";

import { GraphExplorer } from "@/components/graph/graph-explorer";
import { buildKnowledgeGraph } from "@/lib/graph";
import { getAllPostMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "연결",
  description: "주제와 낱말, 글이 서로 어떻게 이어져 있는지 그림으로 봅니다.",
};

export default function GraphPage() {
  const posts = getAllPostMeta();
  const data = buildKnowledgeGraph(posts);

  return (
    <div className="container pb-10 pt-14 sm:pt-20">
      <header className="mb-12 max-w-2xl">
        <p className="section-label">연결</p>
        <h1 className="mt-8 font-serif text-display-2 font-light text-ink">
          글은 혼자 있지 않아요.
        </h1>
        <p className="mt-5 leading-relaxed text-muted">
          SQL에서 정규화로, 정규화에서 트랜잭션으로. 개념들이 어떻게 이어지는지 따라가다 보면 다음에 읽을 글이 보여요.
        </p>
      </header>
      <GraphExplorer data={data} posts={posts} />
    </div>
  );
}
