"use client";

import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";

import { BentoCard, CardHeader } from "@/components/home/bento-card";
import { categories, categoryClasses } from "@/lib/site";
import { cn, formatDate } from "@/lib/utils";
import type { PostMeta } from "@/types/post";

export function LatestPostsCard({ posts, index }: { posts: PostMeta[]; index: number }) {
  return (
    <BentoCard index={index} plain static className="p-6 md:col-span-2 lg:col-span-4">
      <CardHeader
        icon={Newspaper}
        eyebrow="Recent Writing"
        action={
          <Link href="/posts" className="inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground">
            전체 보기 <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      <ul className="mt-3 divide-y divide-border/70">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="group/row -mx-2 flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-surface-muted/60"
            >
              <time dateTime={post.date} className="hidden w-24 shrink-0 font-mono text-xs text-muted sm:block">
                {formatDate(post.date)}
              </time>
              <span className={cn("size-2 shrink-0 rounded-full", categoryClasses[post.category].dot)} />
              <span className="min-w-0 flex-1 truncate font-medium transition-colors group-hover/row:text-primary">
                {post.title}
              </span>
              <span className="hidden shrink-0 text-xs text-muted md:block">{categories[post.category].label}</span>
              <span className="w-14 shrink-0 text-right font-mono text-xs text-muted">{post.readingTime.minutes} min</span>
              <ArrowRight className="size-4 shrink-0 text-muted opacity-0 transition-all group-hover/row:translate-x-0.5 group-hover/row:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}
