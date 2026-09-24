import { CategoriesCard } from "@/components/home/categories-card";
import { GraphPreviewCard } from "@/components/home/graph-preview-card";
import { HeroCard } from "@/components/home/hero-card";
import { LatestPostsCard } from "@/components/home/latest-posts-card";
import { PacketFlow, PythonRepl } from "@/components/home/mini-visuals";
import { FeaturedPostCard, PostMiniCard } from "@/components/home/post-cards";
import { RoadmapCard } from "@/components/home/roadmap-card";
import { StudyStatsCard } from "@/components/home/study-stats-card";
import { buildKnowledgeGraph } from "@/lib/graph";
import { getAllPostMeta, getAllTags, getPostBySlug } from "@/lib/posts";
import { categoryList } from "@/lib/site";
import { getStudyStats } from "@/lib/study-data";
import { extractToc } from "@/lib/toc";
import type { CategoryId, PostMeta } from "@/types/post";

/** Featured 카드에 넣을 SQL 스니펫 (정적 하이라이트) */
function SqlSnippet() {
  const k = "text-cat-cs"; // keyword
  const f = "text-cat-network"; // function
  const c = "text-muted/70"; // comment
  return (
    <code>
      <span className={c}>-- 부서별 급여 순위 (행을 유지한 채 집계)</span>
      {"\n"}
      <span className={k}>SELECT</span> dept, name, salary,
      {"\n       "}
      <span className={f}>RANK</span>() <span className={k}>OVER</span> (
      {"\n         "}
      <span className={k}>PARTITION BY</span> dept
      {"\n         "}
      <span className={k}>ORDER BY</span> salary <span className={k}>DESC</span>
      {"\n       "}) <span className={k}>AS</span> rnk
      {"\n"}
      <span className={k}>FROM</span> employees;
    </code>
  );
}

function pickFeatured(posts: PostMeta[], category: CategoryId) {
  return posts.find((p) => p.category === category && p.featured) ?? posts.find((p) => p.category === category);
}

export default function HomePage() {
  const posts = getAllPostMeta();
  const tags = getAllTags();
  const graph = buildKnowledgeGraph(posts);
  const stats = getStudyStats();

  const counts = Object.fromEntries(
    categoryList.map((c) => [c.id, posts.filter((p) => p.category === c.id).length]),
  ) as Record<CategoryId, number>;

  const sqlPost = pickFeatured(posts, "database");
  const pythonPost = pickFeatured(posts, "python");
  const networkPost = pickFeatured(posts, "network");
  const sqlOutline = sqlPost
    ? extractToc(getPostBySlug(sqlPost.slug)?.source ?? "")
        .filter((t) => t.depth === 2)
        .map((t) => t.text)
    : [];

  return (
    <div className="container pb-8 pt-6 sm:pt-10">
      {/*
        Bento Grid (lg: 4 columns)
        ┌──────────┬──────────┐
        │  Hero    │  Graph   │
        ├──────────┼────┬─────┤
        │ Featured │ Py │ Net │
        │  (SQL)   ├────┴─────┤
        │          │Categories│
        ├──────────┼──────────┤
        │ Roadmap  │  Stats   │
        ├──────────┴──────────┤
        │   Recent writing    │
        └─────────────────────┘
      */}
      <div className="grid auto-rows-[minmax(0,auto)] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <HeroCard
          stats={{
            posts: posts.length,
            tags: tags.length,
            categories: categoryList.length,
            minutes: posts.reduce((a, p) => a + p.readingTime.minutes, 0),
          }}
        />
        <GraphPreviewCard data={graph} />

        {sqlPost && (
          <FeaturedPostCard
            post={sqlPost}
            snippet={<SqlSnippet />}
            filename="ranking.sql"
            outline={sqlOutline}
            index={2}
          />
        )}
        {pythonPost && <PostMiniCard post={pythonPost} index={3} visual={<PythonRepl />} />}
        {networkPost && <PostMiniCard post={networkPost} index={4} visual={<PacketFlow />} />}
        <CategoriesCard counts={counts} tags={tags} index={5} />

        <RoadmapCard index={6} />
        <StudyStatsCard stats={stats} index={7} />

        <LatestPostsCard posts={posts} index={8} />
      </div>
    </div>
  );
}
