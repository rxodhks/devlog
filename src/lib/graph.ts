import { categories } from "@/lib/site";
import type { CategoryId, PostMeta } from "@/types/post";

export type GraphNodeKind = "category" | "tag" | "post";

export interface GraphNode {
  id: string;
  label: string;
  kind: GraphNodeKind;
  category: CategoryId | null;
  /** post 노드 → /posts/[slug] */
  slug?: string;
  /** tag 노드 → /posts?tag= */
  tag?: string;
  /** 연결 수 기반 크기 */
  val: number;
  /** 사이드 패널에서 보여줄 관련 포스트 slug */
  posts: string[];
}

export interface GraphLink {
  source: string;
  target: string;
  kind: "category-post" | "post-tag" | "post-post";
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * 카테고리 ↔ 포스트 ↔ 태그 ↔ 포스트 로 이어지는 지식 그래프를 만듭니다.
 * 예) Database ─ 정규화 ─ #SQL ─ 윈도우 함수 ─ #Query Optimization
 */
export function buildKnowledgeGraph(posts: PostMeta[]): KnowledgeGraphData {
  const nodes = new Map<string, GraphNode>();
  const links: GraphLink[] = [];
  const linkKeys = new Set<string>();

  const addLink = (source: string, target: string, kind: GraphLink["kind"]) => {
    const key = [source, target].sort().join("|");
    if (linkKeys.has(key)) return;
    linkKeys.add(key);
    links.push({ source, target, kind });
  };

  // 1) category nodes (포스트가 있는 카테고리만)
  for (const cat of Object.values(categories)) {
    const catPosts = posts.filter((p) => p.category === cat.id);
    if (catPosts.length === 0) continue;
    nodes.set(`cat:${cat.id}`, {
      id: `cat:${cat.id}`,
      label: cat.name,
      kind: "category",
      category: cat.id,
      val: 14,
      posts: catPosts.map((p) => p.slug),
    });
  }

  // 2) post nodes + tag nodes
  const tagCategoryVotes = new Map<string, Map<CategoryId, number>>();

  for (const post of posts) {
    const postId = `post:${post.slug}`;
    nodes.set(postId, {
      id: postId,
      label: post.shortTitle ?? post.title.split(":")[0],
      kind: "post",
      category: post.category,
      slug: post.slug,
      val: 5,
      posts: [post.slug],
    });
    addLink(`cat:${post.category}`, postId, "category-post");

    for (const tag of post.tags) {
      const tagId = `tag:${tag}`;
      const existing = nodes.get(tagId);
      if (existing) {
        existing.posts.push(post.slug);
        existing.val += 1.5;
      } else {
        nodes.set(tagId, { id: tagId, label: tag, kind: "tag", category: null, tag, val: 3, posts: [post.slug] });
      }
      addLink(postId, tagId, "post-tag");

      const votes = tagCategoryVotes.get(tag) ?? new Map<CategoryId, number>();
      votes.set(post.category, (votes.get(post.category) ?? 0) + 1);
      tagCategoryVotes.set(tag, votes);
    }
  }

  // 3) explicit related links
  const slugs = new Set(posts.map((p) => p.slug));
  for (const post of posts) {
    for (const rel of post.related ?? []) {
      if (slugs.has(rel)) addLink(`post:${post.slug}`, `post:${rel}`, "post-post");
    }
  }

  // 4) 태그 색상 = 해당 태그를 가장 많이 쓴 카테고리
  for (const [tag, votes] of tagCategoryVotes) {
    const node = nodes.get(`tag:${tag}`);
    if (!node) continue;
    node.category = [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  return { nodes: [...nodes.values()], links };
}

/** 노드 클릭 시 이동할 경로 */
export function hrefForNode(node: Pick<GraphNode, "kind" | "slug" | "tag" | "category">) {
  if (node.kind === "post") return `/posts/${node.slug}`;
  if (node.kind === "tag") return `/posts?tag=${encodeURIComponent(node.tag ?? "")}`;
  return `/posts?category=${node.category}`;
}
