import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { CategoryBadge } from "@/components/post/category-badge";
import { DifficultyTag } from "@/components/post/difficulty-tag";
import { PostSidebar } from "@/components/post/post-sidebar";
import { ReadingProgress } from "@/components/post/reading-progress";
import { TableOfContents } from "@/components/post/table-of-contents";
import { renderMdx } from "@/lib/mdx";
import { getAdjacentPosts, getAllPosts, getPostBySlug } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { extractToc } from "@/lib/toc";
import { formatDateKo } from "@/lib/utils";

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

  const content = await renderMdx(post.source);
  const toc = extractToc(post.source);
  const { newer, older, related } = getAdjacentPosts(slug);

  return (
    <>
      <ReadingProgress />

      <article className="container pb-10 pt-14 sm:pt-20">
        {/* ───────── 머리말 ───────── */}
        <header className="mx-auto max-w-[1100px]">
          <div className="max-w-[760px]">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <CategoryBadge category={post.category} />
              {post.series && <span className="font-serif text-sm italic text-muted">{post.series}</span>}
            </div>

            <h1 className="mt-7 text-balance font-serif text-display-2 font-light text-ink">{post.title}</h1>
            <p className="mt-6 text-pretty font-serif text-[1.2rem] font-light leading-[1.75] text-muted">
              {post.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
              <span className="text-ink-soft">{siteConfig.author.name}</span>
              <span className="text-faint">·</span>
              <time dateTime={post.date} className="font-serif italic">
                {formatDateKo(post.date)}
              </time>
              <span className="text-faint">·</span>
              <span>{post.readingTime.minutes}분 분량</span>
              <span className="text-faint">·</span>
              <DifficultyTag difficulty={post.difficulty} />
            </div>
          </div>
          <div className="mt-12 h-px w-full bg-rule" />
        </header>

        <div className="mx-auto mt-12 grid max-w-[1100px] grid-cols-1 gap-16 lg:grid-cols-[minmax(0,700px)_220px] lg:justify-between">
          <div className="min-w-0">
            {/* 모바일·태블릿 차례 */}
            <details className="group mb-10 border-b border-rule pb-4 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-muted marker:hidden">
                <span className="meta text-sm">차례 펼치기</span>
                <span className="font-serif transition-transform duration-500 group-open:rotate-45">+</span>
              </summary>
              <TableOfContents items={toc} group="toc-mobile" className="mt-5" />
            </details>

            <div className="prose prose-paper">{content}</div>

            {/* 태그 */}
            <p className="mt-16 text-sm leading-[2] text-muted">
              <span className="meta mr-3 text-sm">낱말</span>
              {post.tags.map((tag, i) => (
                <span key={tag}>
                  <Link href={`/posts?tag=${encodeURIComponent(tag)}`} className="ink-link text-ink-soft hover:text-ink">
                    {tag}
                  </Link>
                  {i < post.tags.length - 1 && <span className="mx-2 text-faint">·</span>}
                </span>
              ))}
            </p>

            {/* ───────── 맺음 ───────── */}
            <footer className="mt-16 border-t border-rule pt-10">
              <div className="grid gap-8 sm:grid-cols-2">
                {older ? (
                  <Link href={`/posts/${older.slug}`} className="group">
                    <span className="meta inline-flex items-center gap-1.5 text-sm">
                      <ArrowLeft className="size-3.5 transition-transform duration-500 group-hover:-translate-x-1" strokeWidth={1.5} />
                      이전 글
                    </span>
                    <span className="mt-2 block font-serif text-lg leading-snug text-ink">
                      <span className="ink-link">{older.title}</span>
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {newer && (
                  <Link href={`/posts/${newer.slug}`} className="group sm:text-right">
                    <span className="meta inline-flex items-center gap-1.5 text-sm">
                      다음 글
                      <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
                    </span>
                    <span className="mt-2 block font-serif text-lg leading-snug text-ink">
                      <span className="ink-link">{newer.title}</span>
                    </span>
                  </Link>
                )}
              </div>

              {related.length > 0 && (
                <section className="mt-16">
                  <p className="section-label">이어서 읽기 좋은 글</p>
                  <ul className="mt-6">
                    {related.map((r) => (
                      <li key={r.slug} className="border-t border-rule first:border-t-0">
                        <Link href={`/posts/${r.slug}`} className="group flex items-baseline justify-between gap-6 py-4">
                          <span className="font-serif text-[1.1rem] text-ink transition-colors duration-500 group-hover:text-accent">
                            <span className="ink-link">{r.title}</span>
                          </span>
                          <CategoryBadge category={r.category} link={false} className="shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </footer>
          </div>

          {/* ───────── 오른쪽 여백 ───────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <PostSidebar toc={toc} readingTime={post.readingTime} difficulty={post.difficulty} />
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
