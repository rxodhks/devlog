import Link from "next/link";

import { Reveal } from "@/components/home/reveal";
import { PostRow } from "@/components/posts/post-row";
import type { PostMeta } from "@/types/post";

/** 카드 대신 책의 목차처럼 읽히는 글 목록 */
export function PostIndex({ posts, label = "최근의 기록", showAllLink = true }: { posts: PostMeta[]; label?: string; showAllLink?: boolean }) {
  return (
    <section aria-label={label}>
      <Reveal className="flex items-baseline justify-between">
        <p className="section-label">{label}</p>
        {showAllLink && (
          <Link href="/posts" className="ink-link text-sm text-muted hover:text-ink">
            모든 글 보기
          </Link>
        )}
      </Reveal>

      <ol className="mt-8 border-b border-rule">
        {posts.map((post, i) => (
          <Reveal as="li" key={post.slug} delay={i * 0.06} className="border-t border-rule">
            <PostRow post={post} />
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
