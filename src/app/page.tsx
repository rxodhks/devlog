import { Intro } from "@/components/home/intro";
import { LeadArticle } from "@/components/home/lead-article";
import { LearningPath } from "@/components/home/learning-path";
import { PostIndex } from "@/components/home/post-index";
import { StudyTraces } from "@/components/home/study-traces";
import { Topics } from "@/components/home/topics";
import { buildKnowledgeGraph } from "@/lib/graph";
import { getAllPostMeta, getAllTags, getPostBySlug } from "@/lib/posts";
import { categoryList } from "@/lib/site";
import { getStudyStats } from "@/lib/study-data";
import { extractToc } from "@/lib/toc";
import type { CategoryId } from "@/types/post";

/** "이번 글" 옆에 조용히 놓이는 코드 한 조각 */
function SqlExcerpt() {
  const k = "text-accent"; // keyword — 세이지 하나로만
  const c = "text-muted italic"; // comment
  return (
    <code>
      <span className={c}>-- 행은 그대로, 옆에 순위를 붙인다</span>
      {"\n"}
      <span className={k}>SELECT</span> dept, name, salary,
      {"\n       "}RANK() <span className={k}>OVER</span> (
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

export default function HomePage() {
  const posts = getAllPostMeta();
  const tags = getAllTags();
  const graph = buildKnowledgeGraph(posts);
  const latest = posts[0];
  const stats = getStudyStats(latest?.date ?? "2026-09-18");

  const counts = Object.fromEntries(
    categoryList.map((c) => [c.id, posts.filter((p) => p.category === c.id).length]),
  ) as Record<CategoryId, number>;

  // "이번 글": 가장 최근의 대표 글
  const lead = posts.find((p) => p.featured) ?? latest;
  const outline = lead
    ? extractToc(getPostBySlug(lead.slug)?.source ?? "")
        .filter((t) => t.depth === 2)
        .map((t) => t.text)
    : [];
  const rest = posts.filter((p) => p.slug !== lead?.slug);

  return (
    <div className="container">
      <div className="space-y-28 pb-8 pt-12 sm:space-y-36 sm:pt-20">
        {latest && (
          <Intro
            latest={latest}
            totalPosts={posts.length}
            totalMinutes={posts.reduce((a, p) => a + p.readingTime.minutes, 0)}
            graph={graph}
          />
        )}

        {lead && <LeadArticle post={lead} outline={outline} excerpt={<SqlExcerpt />} excerptLabel="ranking.sql" />}

        <PostIndex posts={rest} />

        <div className="grid grid-cols-1 gap-y-24 lg:grid-cols-12 lg:gap-x-10">
          <div className="min-w-0 lg:col-span-5">
            <Topics counts={counts} tags={tags} />
          </div>
          <div className="min-w-0 lg:col-span-6 lg:col-start-7">
            <LearningPath />
          </div>
        </div>

        <StudyTraces stats={stats} />
      </div>
    </div>
  );
}
