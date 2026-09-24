import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Constellation } from "@/components/home/constellation";
import { Marker } from "@/components/home/marker";
import { Reveal } from "@/components/home/reveal";
import type { KnowledgeGraphData } from "@/lib/graph";
import { siteConfig } from "@/lib/site";
import { formatDateKo } from "@/lib/utils";
import type { PostMeta } from "@/types/post";

interface IntroProps {
  latest: PostMeta;
  totalPosts: number;
  totalMinutes: number;
  graph: KnowledgeGraphData;
}

export function Intro({ latest, totalPosts, totalMinutes, graph }: IntroProps) {
  const notes = [
    { k: "요즘 붙잡고 있는 것", v: siteConfig.now.studying, href: undefined },
    {
      k: "가장 최근에 쓴 글",
      v: latest.shortTitle ?? latest.title,
      href: `/posts/${latest.slug}`,
      sub: formatDateKo(latest.date, false),
    },
    { k: "지금까지", v: `${totalPosts}편의 글, 약 ${totalMinutes}분 분량`, href: "/posts" },
  ];

  return (
    <section className="relative">
      <div className="grid grid-cols-1 items-center gap-y-6 lg:grid-cols-12 lg:gap-x-10">
        {/* ── 인사말 ── */}
        <div className="min-w-0 lg:col-span-7">
          <Reveal>
            <p className="section-label">{siteConfig.author.name}의 공부 노트</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-8 font-serif text-display-1 font-light text-ink">
              천천히 이해한 것들을
              <br />
              <Marker>조용히 적어 두는</Marker> 곳.
            </h1>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-8 max-w-[34rem] text-pretty text-[1.05rem] leading-[1.9] text-ink-soft">
              {siteConfig.author.bio}
            </p>
          </Reveal>
          <Reveal delay={0.35}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.95rem]">
              <Link href="/posts" className="group inline-flex items-center gap-2 text-ink">
                <span className="ink-link">글 읽으러 가기</span>
                <ArrowRight className="size-4 text-accent transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
              <Link href="/graph" className="group inline-flex items-center gap-2 text-muted hover:text-ink">
                <span className="ink-link">생각이 이어진 모양 보기</span>
                <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* ── 별자리 (지식 그래프 미리보기) ── */}
        <Reveal delay={0.3} className="relative min-w-0 lg:col-span-5">
          <Constellation data={graph} />
        </Reveal>
      </div>

      {/* ── 여백 메모 ── */}
      <Reveal delay={0.45}>
        <dl className="mt-16 grid gap-8 border-t border-rule pt-8 sm:grid-cols-3">
          {notes.map((n, i) => (
            <div key={n.k} className="flex gap-3">
              <span className="font-serif text-sm italic text-accent">{["i", "ii", "iii"][i]}.</span>
              <div className="min-w-0">
                <dt className="meta text-sm">{n.k}</dt>
                <dd className="mt-1.5 text-[0.98rem] text-ink">
                  {n.href ? (
                    <Link href={n.href} className="ink-link">
                      {n.v}
                    </Link>
                  ) : (
                    n.v
                  )}
                  {n.sub && <span className="ml-2 font-serif text-sm italic text-muted">{n.sub}</span>}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
