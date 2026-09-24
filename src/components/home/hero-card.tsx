"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, Network } from "lucide-react";

import { BentoCard } from "@/components/home/bento-card";
import { GithubIcon } from "@/components/layout/icons";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const FOCUS_WORDS = ["Computer Science", "Database · SQL", "Python", "Computer Networking"];

interface HeroStats {
  posts: number;
  tags: number;
  categories: number;
  minutes: number;
}

export function HeroCard({ stats }: { stats: HeroStats }) {
  const [wordIndex, setWordIndex] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setWordIndex((i) => (i + 1) % FOCUS_WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <BentoCard index={0} className="flex flex-col p-6 sm:p-8 md:col-span-2 lg:row-span-2">
      <div className="flex h-full flex-col">
        {/* 터미널 프롬프트 */}
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-surface-muted/70 px-2.5 py-1 font-mono text-xs text-muted">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          ~/techlog <span className="text-primary">$</span> whoami
        </div>

        <h1 className="mt-6 text-balance text-[2rem] font-bold leading-[1.2] tracking-tight sm:text-[2.6rem]">
          안녕하세요, {siteConfig.author.name}입니다.
          <br />
          <span className="text-gradient animate-gradient-x">배운 것을 코드로 증명하는</span> 기록.
        </h1>

        <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted">{siteConfig.author.bio}</p>

        <div className="mt-5 flex items-center gap-2 font-mono text-sm">
          <span className="text-muted">focus:</span>
          <span className="relative inline-flex h-6 min-w-[12rem] items-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={FOCUS_WORDS[wordIndex]}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="font-semibold text-foreground"
              >
                {FOCUS_WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
            <span className="ml-0.5 inline-block h-4 w-[7px] animate-blink bg-primary" />
          </span>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <Button asChild variant="primary" size="lg">
            <Link href="/posts">
              글 읽으러 가기 <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/graph">
              <Network /> 지식 그래프
            </Link>
          </Button>
          <div className="ml-1 flex items-center gap-1">
            <a
              href={siteConfig.author.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <GithubIcon className="size-[18px]" />
            </a>
            <a
              href={siteConfig.author.email}
              aria-label="Email"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <Mail className="size-[18px]" />
            </a>
          </div>
        </div>

        <dl className="mt-auto grid grid-cols-4 gap-2 border-t border-border pt-5 max-sm:mt-8">
          {[
            { label: "Posts", value: stats.posts },
            { label: "Tags", value: stats.tags },
            { label: "Topics", value: stats.categories },
            { label: "Read min", value: stats.minutes },
          ].map((s) => (
            <div key={s.label}>
              <dt className="font-mono text-[10.5px] uppercase tracking-wider text-muted">{s.label}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </BentoCard>
  );
}
