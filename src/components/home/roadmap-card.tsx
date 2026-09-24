"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Map as MapIcon, RotateCcw, Target } from "lucide-react";

import { BentoCard, CardHeader } from "@/components/home/bento-card";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  label: string;
}

interface Phase {
  id: string;
  title: string;
  items: Milestone[];
}

/** 학습 로드맵 — 필요에 맞게 자유롭게 수정하세요. */
const ROADMAP: Phase[] = [
  {
    id: "foundation",
    title: "Foundations",
    items: [
      { id: "ds-algo", label: "자료구조 · 정렬 알고리즘" },
      { id: "sql-basic", label: "SQL 기본 문법 · JOIN" },
      { id: "git", label: "Git 브랜치 전략" },
    ],
  },
  {
    id: "backend",
    title: "Backend & Data",
    items: [
      { id: "normalization", label: "정규화 · ERD 설계" },
      { id: "transaction", label: "트랜잭션 · 격리 수준" },
      { id: "index", label: "인덱스 · 실행 계획 튜닝" },
      { id: "spring", label: "Spring Boot REST API" },
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    items: [
      { id: "react-state", label: "React 상태 관리" },
      { id: "next-app", label: "Next.js App Router" },
    ],
  },
  {
    id: "infra",
    title: "Network & Infra",
    items: [
      { id: "tcp", label: "TCP · HTTP 심화" },
      { id: "docker", label: "Docker · CI/CD 배포" },
    ],
  },
];

const WEEKLY_GOALS = [
  { label: "기술 글 발행", current: 1, target: 2, unit: "편" },
  { label: "알고리즘 문제 풀이", current: 9, target: 10, unit: "문제" },
  { label: "학습 시간", current: 28.1, target: 25, unit: "h" },
];

const DEFAULT_DONE = ["ds-algo", "sql-basic", "git", "normalization", "transaction", "react-state", "tcp"];
const STORAGE_KEY = "techlog:roadmap:v1";

export function RoadmapCard({ index }: { index: number }) {
  const [done, setDone] = React.useState<Set<string>>(() => new Set(DEFAULT_DONE));
  const [hydrated, setHydrated] = React.useState(false);

  // 방문자 브라우저에 진행 상황 저장 (private 모드 등에서 실패해도 동작)
  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setDone(new Set(JSON.parse(saved) as string[]));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
    } catch {
      /* ignore */
    }
  }, [done, hydrated]);

  const all = ROADMAP.flatMap((p) => p.items);
  const progress = done.size / all.length;
  const current = all.find((m) => !done.has(m.id));

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <BentoCard index={index} className="p-6 md:col-span-2 lg:row-span-2">
      <div className="flex h-full flex-col">
        <CardHeader
          icon={MapIcon}
          eyebrow="Learning Roadmap"
          title="Full-stack 로드맵"
          action={
            <button
              type="button"
              onClick={() => setDone(new Set(DEFAULT_DONE))}
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              aria-label="진행 상황 초기화"
              title="초기화"
            >
              <RotateCcw className="size-3.5" />
            </button>
          }
        />

        {/* 전체 진행률 링 + 현재 목표 */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl bg-surface-muted/60 p-4">
          <div className="relative grid size-16 shrink-0 place-items-center">
            <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
              <circle cx="32" cy="32" r={R} fill="none" strokeWidth="5" className="stroke-border" />
              <motion.circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                className="stroke-success"
                strokeDasharray={C}
                initial={false}
                animate={{ strokeDashoffset: C * (1 - progress) }}
                transition={{ type: "spring", stiffness: 90, damping: 18 }}
              />
            </svg>
            <span className="text-sm font-bold tabular-nums">{Math.round(progress * 100)}%</span>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Target className="size-3.5 text-primary" /> 현재 목표
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={current?.id ?? "done"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-0.5 truncate font-semibold"
              >
                {current ? current.label : "모든 마일스톤 완료! 🎉"}
              </motion.p>
            </AnimatePresence>
            <p className="mt-0.5 text-xs text-muted">
              {done.size} / {all.length} milestones
            </p>
          </div>
        </div>

        {/* Phases */}
        <ol className="mt-5 grid content-start gap-x-4 gap-y-5 sm:grid-cols-2">
          {ROADMAP.map((phase, pi) => {
            const phaseDone = phase.items.filter((i) => done.has(i.id)).length;
            return (
              <li key={phase.id}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    0{pi + 1} · {phase.title}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {phaseDone}/{phase.items.length}
                  </span>
                </div>
                <ul className="space-y-1">
                  {phase.items.map((item) => {
                    const checked = done.has(item.id);
                    const isCurrent = current?.id === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => toggle(item.id)}
                          aria-pressed={checked}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-muted",
                            isCurrent && "bg-primary/[0.07] ring-1 ring-primary/30",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-[18px] shrink-0 place-items-center rounded-md border transition-colors",
                              checked ? "border-success bg-success text-white" : "border-border bg-surface",
                            )}
                          >
                            <AnimatePresence>
                              {checked && (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: "spring", stiffness: 600, damping: 24 }}
                                >
                                  <Check className="size-3" strokeWidth={3} />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                          <span className={cn("truncate", checked && "text-muted line-through decoration-muted/50")}>
                            {item.label}
                          </span>
                          {isCurrent && (
                            <span className="ml-auto shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                              NOW
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>

        {/* 주간 목표 */}
        <div className="mt-auto pt-6">
          <p className="eyebrow mb-3">This week&apos;s goals</p>
          <div className="space-y-3">
            {WEEKLY_GOALS.map((g) => {
              const ratio = Math.min(1, g.current / g.target);
              return (
                <div key={g.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted">{g.label}</span>
                    <span className="font-mono tabular-nums">
                      <span className={ratio >= 1 ? "text-success" : "text-foreground"}>{g.current}</span>
                      <span className="text-muted"> / {g.target}{g.unit}</span>
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                    <motion.div
                      className={cn("h-full rounded-full", ratio >= 1 ? "bg-success" : "bg-brand-gradient")}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${ratio * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
