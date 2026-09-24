"use client";

import * as React from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUp, BookOpen, Check, Clock, Code2, Link2 } from "lucide-react";

import { DifficultyTag } from "@/components/post/difficulty-tag";
import { TableOfContents } from "@/components/post/table-of-contents";
import type { Difficulty, ReadingTime, TocItem } from "@/types/post";

interface Props {
  toc: TocItem[];
  readingTime: ReadingTime;
  difficulty: Difficulty;
}

export function PostSidebar({ toc, readingTime, difficulty }: Props) {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => setProgress(v));

  const remaining = Math.max(0, Math.ceil(readingTime.minutes * (1 - progress)));
  const R = 18;
  const C = 2 * Math.PI * R;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-5">
      {/* Reading stats */}
      <div className="rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative grid size-12 place-items-center">
            <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
              <circle cx="22" cy="22" r={R} fill="none" strokeWidth="3" className="stroke-border" />
              <motion.circle
                cx="22"
                cy="22"
                r={R}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="url(#progress-gradient)"
                strokeDasharray={C}
                style={{ strokeDashoffset: C * (1 - progress) }}
              />
              <defs>
                <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" />
                  <stop offset="100%" stopColor="rgb(var(--cyan))" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-mono text-[11px] font-semibold tabular-nums">{Math.round(progress * 100)}%</span>
          </div>
          <div className="min-w-0 text-sm">
            <p className="flex items-center gap-1.5 font-medium">
              <Clock className="size-3.5 text-primary" />
              {readingTime.minutes} min read
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {remaining > 0 ? `약 ${remaining}분 남음` : "다 읽었어요 🎉"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl bg-surface-muted/70 px-3 py-2">
            <p className="flex items-center gap-1 text-muted">
              <BookOpen className="size-3" /> Words
            </p>
            <p className="mt-0.5 font-mono font-semibold tabular-nums">{readingTime.words.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-surface-muted/70 px-3 py-2">
            <p className="flex items-center gap-1 text-muted">
              <Code2 className="size-3" /> Code lines
            </p>
            <p className="mt-0.5 font-mono font-semibold tabular-nums">{readingTime.codeLines}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted">Difficulty</span>
          <DifficultyTag difficulty={difficulty} />
        </div>
      </div>

      <TableOfContents items={toc} className="max-h-[calc(100vh-22rem)] overflow-y-auto pr-1 no-scrollbar" />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface/70 py-2 text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <ArrowUp className="size-3.5" /> Top
        </button>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface/70 py-2 text-xs text-muted transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Link2 className="size-3.5" />}
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </div>
  );
}
