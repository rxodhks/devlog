"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Reveal } from "@/components/home/reveal";
import { cn, toRoman } from "@/lib/utils";

interface Phase {
  id: string;
  title: string;
  items: { id: string; label: string }[];
}

/** 학습 로드맵 — 필요에 맞게 자유롭게 수정하세요. */
const ROADMAP: Phase[] = [
  {
    id: "foundation",
    title: "기초 다지기",
    items: [
      { id: "ds-algo", label: "자료구조와 정렬 알고리즘" },
      { id: "sql-basic", label: "SQL 기본 문법과 JOIN" },
      { id: "git", label: "Git 브랜치 전략" },
    ],
  },
  {
    id: "backend",
    title: "백엔드와 데이터",
    items: [
      { id: "normalization", label: "정규화와 ERD 설계" },
      { id: "transaction", label: "트랜잭션과 격리 수준" },
      { id: "index", label: "인덱스와 실행 계획" },
      { id: "spring", label: "Spring Boot로 REST API" },
    ],
  },
  {
    id: "frontend",
    title: "화면 만들기",
    items: [
      { id: "react-state", label: "React 상태 관리" },
      { id: "next-app", label: "Next.js App Router" },
    ],
  },
  {
    id: "infra",
    title: "네트워크와 배포",
    items: [
      { id: "tcp", label: "TCP와 HTTP 깊게 보기" },
      { id: "docker", label: "Docker와 CI/CD" },
    ],
  },
];

const WEEKLY_GOALS = [
  { label: "글", current: 1, target: 2, unit: "편" },
  { label: "문제", current: 9, target: 10, unit: "개" },
  { label: "공부", current: 28, target: 25, unit: "시간" },
];

const DEFAULT_DONE = ["ds-algo", "sql-basic", "git", "normalization", "transaction", "react-state", "tcp"];
const STORAGE_KEY = "techlog:roadmap:v1";

/** 배움의 지도 — 한 줄로 이어지는 길 위의 이정표 */
export function LearningPath() {
  const [done, setDone] = React.useState<Set<string>>(() => new Set(DEFAULT_DONE));
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setDone(new Set(JSON.parse(saved) as string[]));
    } catch {
      /* private 모드 등 — 기본값 유지 */
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
  const current = all.find((m) => !done.has(m.id));
  const progress = done.size / all.length;

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section aria-label="배움의 지도">
      <Reveal className="flex items-baseline justify-between gap-4">
        <p className="section-label">배움의 지도</p>
        <button
          type="button"
          onClick={() => setDone(new Set(DEFAULT_DONE))}
          className="ink-link text-sm text-muted hover:text-ink"
        >
          처음 상태로
        </button>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-8 font-serif text-[1.3rem] font-light leading-relaxed text-ink">
          {all.length}개의 이정표 중 <span className="font-normal">{done.size}개</span>를 지나왔어요.
        </p>
        <div className="mt-4 h-px w-full bg-rule-strong">
          <motion.div
            className="h-px bg-accent"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </Reveal>

      <Reveal delay={0.2} className="relative mt-10">
        {/* 세로로 이어지는 길 */}
        <span aria-hidden className="absolute bottom-3 left-[5px] top-2 w-px bg-rule-strong" />
        <ol className="space-y-7">
          {ROADMAP.map((phase, pi) => (
            <li key={phase.id}>
              <p className="mb-2 pl-7 font-serif text-sm italic text-muted">
                {toRoman(pi + 1)}. {phase.title}
              </p>
              <ul className="space-y-0.5">
                {phase.items.map((item) => {
                  const checked = done.has(item.id);
                  const isCurrent = current?.id === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        aria-pressed={checked}
                        className="group relative flex w-full items-center gap-4 py-1.5 text-left"
                      >
                        <span className="relative grid size-[11px] shrink-0 place-items-center">
                          <span
                            className={cn(
                              "absolute inset-0 rounded-full border bg-paper transition-colors duration-500",
                              checked ? "border-accent bg-accent" : isCurrent ? "border-accent" : "border-rule-strong group-hover:border-muted",
                            )}
                          />
                          {isCurrent && <span className="relative size-[5px] animate-breathe rounded-full bg-accent" />}
                        </span>
                        <span
                          className={cn(
                            "text-[0.98rem] transition-colors duration-500",
                            checked ? "text-muted" : isCurrent ? "text-ink" : "text-ink-soft group-hover:text-ink",
                          )}
                        >
                          {item.label}
                        </span>
                        <AnimatePresence>
                          {isCurrent && (
                            <motion.span
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="font-serif text-sm italic text-accent"
                            >
                              지금 여기
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.3}>
        <p className="mt-10 border-t border-rule pt-5 text-sm leading-relaxed text-muted">
          <span className="meta mr-2 text-sm">이번 주에는</span>
          {WEEKLY_GOALS.map((g, i) => (
            <span key={g.label}>
              {g.label}{" "}
              <span className={cn("tabular-nums", g.current >= g.target ? "text-accent" : "text-ink")}>
                {g.current}/{g.target}
              </span>
              {g.unit}
              {i < WEEKLY_GOALS.length - 1 && <span className="mx-2 text-faint">·</span>}
            </span>
          ))}
        </p>
      </Reveal>
    </section>
  );
}
