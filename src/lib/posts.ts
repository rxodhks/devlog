import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";

import { estimateReadingTime } from "@/lib/reading-time";
import type { CategoryId, Post, PostFrontmatter, PostMeta } from "@/types/post";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

function assertFrontmatter(slug: string, data: Record<string, unknown>): PostFrontmatter {
  const required = ["title", "description", "date", "category", "tags", "difficulty"] as const;
  for (const key of required) {
    if (data[key] === undefined) {
      throw new Error(`[posts] "${slug}.mdx" frontmatter에 "${key}" 필드가 없습니다.`);
    }
  }
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date);
  return { ...(data as unknown as PostFrontmatter), date };
}

/** 모든 포스트 (최신순). React cache로 요청 단위 메모이제이션 */
export const getAllPosts = cache((): Post[] => {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const frontmatter = assertFrontmatter(slug, data);
      return {
        ...frontmatter,
        slug,
        source: content,
        readingTime: estimateReadingTime(content),
      } satisfies Post;
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
});

/** 리스트/카드용 — MDX 본문을 클라이언트로 보내지 않도록 source 제거 */
export const getAllPostMeta = cache((): PostMeta[] =>
  getAllPosts().map(({ source, ...meta }) => meta),
);

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: CategoryId): PostMeta[] {
  return getAllPostMeta().filter((p) => p.category === category);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPostMeta()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** 이전/다음 글 + 같은 태그를 공유하는 관련 글 */
export function getAdjacentPosts(slug: string) {
  const posts = getAllPostMeta();
  const index = posts.findIndex((p) => p.slug === slug);
  const current = posts[index];

  const related = posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score:
        p.tags.filter((t) => current?.tags.includes(t)).length * 2 +
        (p.category === current?.category ? 1 : 0) +
        (current?.related?.includes(p.slug) ? 3 : 0),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.post);

  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
    related,
  };
}
