import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PostExplorer } from "@/components/posts/post-explorer";
import { getAllPostMeta, getAllTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Posts",
  description: "CS, Database/SQL, Python, Network 분야의 모든 글",
};

export default function PostsPage() {
  const posts = getAllPostMeta();
  const tags = getAllTags();

  return (
    <div className="container max-w-5xl pb-10 pt-10 sm:pt-14">
      <header className="mb-8">
        <p className="eyebrow text-primary">SELECT * FROM posts ORDER BY date DESC;</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">All Posts</h1>
        <p className="mt-3 text-muted">
          총 {posts.length}편의 글 · {tags.length}개의 태그. 카테고리나 태그로 필터링하거나{" "}
          <Link href="/graph" className="text-primary hover:underline">
            지식 그래프
          </Link>
          에서 연결 관계로 탐색해 보세요.
        </p>
      </header>
      {/* useSearchParams 사용 → Suspense 경계로 정적 렌더링 유지 */}
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-surface-muted/50" />}>
        <PostExplorer posts={posts} tags={tags} />
      </Suspense>
    </div>
  );
}
