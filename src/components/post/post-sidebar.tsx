"use client";

import * as React from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

import { DifficultyTag } from "@/components/post/difficulty-tag";
import { TableOfContents } from "@/components/post/table-of-contents";
import type { Difficulty, ReadingTime, TocItem } from "@/types/post";

interface Props {
  toc: TocItem[];
  readingTime: ReadingTime;
  difficulty: Difficulty;
}

/** 오른쪽 여백 — 읽기 정보와 차례를 메모처럼 */
export function PostSidebar({ toc, readingTime, difficulty }: Props) {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(v));

  const remaining = Math.max(0, Math.ceil(readingTime.minutes * (1 - progress)));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-10">
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="meta text-sm">읽는 데</dt>
          <dd className="mt-0.5 text-ink">
            {readingTime.minutes}분
            <span className="ml-2 font-serif italic text-muted">
              {progress < 0.02 ? "" : remaining > 0 ? `· 약 ${remaining}분 남음` : "· 다 읽었어요"}
            </span>
          </dd>
        </div>
        <div>
          <dt className="meta text-sm">난이도</dt>
          <dd className="mt-1">
            <DifficultyTag difficulty={difficulty} />
          </dd>
        </div>
        <div>
          <dt className="meta text-sm">분량</dt>
          <dd className="mt-0.5 tabular-nums text-ink-soft">
            {readingTime.words.toLocaleString()}단어 · 코드 {readingTime.codeLines}줄
          </dd>
        </div>
        {/* 읽은 만큼 채워지는 한 줄 */}
        <div className="pt-1" aria-hidden>
          <div className="h-px w-full bg-rule">
            <div className="h-px bg-ink-soft transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </dl>

      <TableOfContents items={toc} className="max-h-[calc(100vh-24rem)] overflow-y-auto pr-1 no-scrollbar" />

      <div className="flex gap-5 text-sm">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="ink-link text-muted hover:text-ink"
        >
          맨 위로
        </button>
        <button type="button" onClick={copyLink} className="ink-link text-muted hover:text-ink">
          {copied ? "주소를 복사했어요" : "주소 복사"}
        </button>
      </div>
    </div>
  );
}
