import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock, Layers } from "lucide-react";

import { CategoryBadge } from "@/components/post/category-badge";
import { DifficultyTag } from "@/components/post/difficulty-tag";
import { PostSidebar } from "@/components/post/post-sidebar";
import { ReadingProgress } from "@/components/post/reading-progress";
import { TableOfContents } from "@/components/post/table-of-contents";
import { renderMdx } from "@/lib/mdx";
import { getAdjacentPosts, getAllPosts, getPostBySlug } from "@/lib/posts";
import { categories } from "@/lib/site";
import { extractToc } from "@/lib/toc";
import { formatDate } from "@/lib/utils";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, tags: post.tags },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const [content, toc] = [await renderMdx(post.source), extractToc(post.source)];
  const { newer, older, related } = getAdjacentPosts(slug);

  return (
    <>
      <ReadingProgress />

      <div className="container pb-10 pt-8 lg:pt-12">
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-12 lg:grid-cols-[minmax(0,780px)_260px] lg:justify-between">
          {/* ───────── Main column ───────── */}
          <article className="min-w-0">
            <header className="mb-10 border-b border-border pb-8">
              <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted">
                <Link href="/posts" className="hover:text-foreground">
                  Posts
                </Link>
                <ChevronRight className="size-3" />
                <Link href={`/posts?category=${post.category}`} className="hover:text-foreground">
                  {categories[post.category].label}
                </Link>
              </nav>

              <div className="mb-5 flex flex-wrap items-center gap-2">
                <CategoryBadge category={post.category} />
                <DifficultyTag difficulty={post.difficulty} />
                {post.series && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted/60 px-2.5 py-0.5 text-xs text-muted">
                    <Layers className="size-3" /> {post.series}
                  </span>
                )}
              </div>

              <h1 className="text-balance text-3xl font-bold leading-[1.25] tracking-tight sm:text-[2.6rem]">
                {post.title}
              </h1>
              <p className="mt-4 text-pretty text-lg leading-relaxed text-muted">{post.description}</p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> {post.readingTime.minutes}분 분량
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/posts?tag=${encodeURIComponent(tag)}`}
                      className="font-mono text-xs text-muted transition-colors hover:text-primary"
                    >
                      #{tag}
                    </Link>
                  ))}
                </span>
              </div>
            </header>

            {/* 모바일/태블릿 목차 */}
            <details className="group mb-8 rounded-2xl border border-border bg-surface/70 p-4 lg:hidden">
              <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
                <span className="flex items-center justify-between">
                  목차 보기
                  <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
                </span>
              </summary>
              <TableOfContents items={toc} group="toc-mobile" className="mt-4" />
            </details>

            <div className="prose prose-techlog dark:prose-invert">{content}</div>

            {/* ───────── Footer: prev / next / related ───────── */}
            <footer className="mt-16 space-y-10 border-t border-border pt-10">
              <div className="grid gap-4 sm:grid-cols-2">
                {older ? (
                  <Link
                    href={`/posts/${older.slug}`}
                    className="group rounded-2xl border border-border bg-surface/70 p-5 transition-colors hover:border-primary/40"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> 이전 글
                    </span>
                    <span className="mt-2 line-clamp-2 block font-semibold">{older.title}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {newer && (
                  <Link
                    href={`/posts/${newer.slug}`}
                    className="group rounded-2xl border border-border bg-surface/70 p-5 text-right transition-colors hover:border-primary/40"
                  >
                    <span className="flex items-center justify-end gap-1 text-xs text-muted">
                      다음 글 <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-2 line-clamp-2 block font-semibold">{newer.title}</span>
                  </Link>
                )}
              </div>

              {related.length > 0 && (
                <section>
                  <h2 className="eyebrow mb-4">Related in the knowledge graph</h2>
                  <ul className="grid gap-3 sm:grid-cols-3">
                    {related.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/posts/${r.slug}`}
                          className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface/70 p-4 transition-colors hover:border-primary/40"
                        >
                          <CategoryBadge category={r.category} link={false} className="self-start" />
                          <span className="line-clamp-3 text-sm font-medium leading-snug">{r.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </footer>
          </article>

          {/* ───────── Sticky sidebar ───────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <PostSidebar toc={toc} readingTime={post.readingTime} difficulty={post.difficulty} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
