import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PostExplorer } from "@/components/posts/post-explorer";
import { getAllPostMeta, getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "글",
  description: "컴퓨터 과학, 데이터베이스, 파이썬, 네트워크에 관해 적어 둔 모든 글",
};

export default function PostsPage() {
  const posts = getAllPostMeta();
  const tags = getAllTags();
  const minutes = posts.reduce((a, p) => a + p.readingTime.minutes, 0);

  return (
    <div className="container pb-10 pt-14 sm:pt-20">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-14 max-w-2xl">
          <p className="section-label">모든 글</p>
          <h1 className="mt-8 font-serif text-display-2 font-light text-ink">
            {posts.length}편의 글, <span className="italic">약 {minutes}분.</span>
          </h1>
          <p className="mt-5 leading-relaxed text-muted">
            주제나 낱말로 골라 읽을 수 있어요. 글이 서로 어떻게 이어지는지 궁금하다면{" "}
            <Link href="/graph" className="ink-link text-ink">
              연결된 모양
            </Link>
            을 먼저 봐도 좋아요.
          </p>
        </header>
        {/* useSearchParams 사용 → Suspense 경계로 정적 렌더링 유지 */}
        <Suspense fallback={<div className="h-96" />}>
          <PostExplorer posts={posts} tags={tags} />
        </Suspense>
      </div>
    </div>
  );
}
