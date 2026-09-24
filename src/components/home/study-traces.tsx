"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Reveal } from "@/components/home/reveal";
import { categories, categoryClasses } from "@/lib/site";
import type { StudyStats } from "@/lib/study-data";
import { cn, formatDateKo } from "@/lib/utils";

/** 단일 색상(세이지) 램프 — 많이 공부한 날일수록 짙어집니다 (sequential) */
const LEVEL = ["bg-seq-0", "bg-seq-1", "bg-seq-2", "bg-seq-3", "bg-seq-4"] as const;
const WEEKDAY = ["월", "화", "수", "목", "금", "토", "일"];

interface Tip {
  x: number;
  y: number;
  text: string;
}

/** 공부의 흔적 — 대시보드 대신 한 문장과 점 몇 개 */
export function StudyTraces({ stats }: { stats: StudyStats }) {
  const areaRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [tip, setTip] = React.useState<Tip | null>(null);

  // 좁은 화면에서는 가장 최근 주가 보이도록 오른쪽 끝으로
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const top = [...stats.byCategory].sort((a, b) => b.hours - a.hours)[0];
  const weekMax = Math.max(...stats.thisWeek.map((d) => d.hours), 1);
  const catTotal = stats.byCategory.reduce((a, b) => a + b.hours, 0);

  const showTip = (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, text: string) => {
    const host = areaRef.current?.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    if (!host) return;
    setTip({ x: r.left - host.left + r.width / 2, y: r.top - host.top, text });
  };

  // 월 라벨: 그 주에 새 달이 시작되면 표시 (라벨끼리 겹치지 않도록 최소 3칸 간격)
  const monthLabels: string[] = [];
  let lastLabeled = -10;
  stats.weeks.forEach((w, i) => {
    const m = Number(w[0].date.slice(5, 7));
    const prev = i > 0 ? Number(stats.weeks[i - 1][0].date.slice(5, 7)) : m;
    const show = (i === 0 || m !== prev) && i - lastLabeled >= 3;
    if (show) lastLabeled = i;
    monthLabels.push(show ? `${m}월` : "");
  });

  return (
    <section aria-label="공부의 흔적">
      <Reveal>
        <p className="section-label">공부의 흔적</p>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-8 max-w-[46rem] text-pretty font-serif text-[1.45rem] font-light leading-[1.7] text-ink sm:text-[1.65rem]">
          지난 {stats.weeks.length}주 동안 <span className="font-normal">{stats.activeDays}일</span>, 약{" "}
          <span className="font-normal">{stats.totalHours}시간</span>을 책상 앞에 앉아 있었어요. 요즘은{" "}
          <span className="whitespace-nowrap">
            <span className={cn("mr-1.5 inline-block size-[9px] -translate-y-[0.15em] rounded-full", categoryClasses[top.id].dot)} />
            <span className="font-normal">{categories[top.id].name}</span>
          </span>
          에 가장 오래 머뭅니다.
        </p>
      </Reveal>

      <div ref={areaRef} className="relative mt-12 grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-12" onMouseLeave={() => setTip(null)}>
        {/* ── 점으로 찍은 달력 (히트맵) ── */}
        <Reveal delay={0.15} className="min-w-0 lg:col-span-8">
          <p className="meta mb-4 text-sm">하루하루 — 짙을수록 오래 공부한 날</p>
          <div className="flex gap-2">
            <div className="grid grid-rows-[auto_repeat(7,1fr)] gap-[5px] pr-1 text-[11px] leading-none text-muted">
              <span className="h-3" />
              {WEEKDAY.map((d, i) => (
                <span key={d} className="flex h-[13px] items-center">
                  {i % 2 === 0 ? d : ""}
                </span>
              ))}
            </div>
            <div ref={scrollRef} className="no-scrollbar flex flex-1 gap-[5px] overflow-x-auto">
              {stats.weeks.map((week, wi) => (
                <div key={wi} className="grid grid-rows-[auto_repeat(7,1fr)] gap-[5px]">
                  <span className="h-3 whitespace-nowrap font-serif text-[11px] italic leading-none text-muted">{monthLabels[wi]}</span>
                  {week.map((day) => {
                    const future = day.future;
                    const text = `${formatDateKo(day.date, false)} · ${day.hours > 0 ? `${day.hours}시간` : "쉬어 간 날"}`;
                    return (
                      <motion.span
                        key={day.date}
                        tabIndex={future ? -1 : 0}
                        role="img"
                        aria-label={future ? undefined : text}
                        aria-hidden={future || undefined}
                        onMouseEnter={(e) => !future && showTip(e, text)}
                        onFocus={(e) => showTip(e, text)}
                        onBlur={() => setTip(null)}
                        initial={{ opacity: 0, scale: 0.3 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: wi * 0.02, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                          "block size-[13px] cursor-default rounded-full outline-none ring-accent transition-transform hover:scale-125 focus-visible:ring-1",
                          future ? "opacity-0" : LEVEL[day.level],
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted">
            <span>적게</span>
            {LEVEL.map((c) => (
              <span key={c} className={cn("size-[9px] rounded-full", c)} />
            ))}
            <span>많이</span>
          </div>
        </Reveal>

        {/* ── 이번 주 + 주제별 ── */}
        <Reveal delay={0.25} className="min-w-0 lg:col-span-4">
          <p className="meta mb-4 text-sm">이번 주</p>
          <div className="flex h-24 items-end gap-3">
            {stats.thisWeek.map((d, i) => {
              const isToday = i === stats.thisWeek.length - 1;
              const text = `${d.label}요일 · ${d.hours}시간`;
              return (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                  <motion.span
                    tabIndex={0}
                    role="img"
                    aria-label={text}
                    onMouseEnter={(e) => showTip(e, text)}
                    onFocus={(e) => showTip(e, text)}
                    onBlur={() => setTip(null)}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${Math.max(4, (d.hours / weekMax) * 72)}px` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "block w-[6px] cursor-default rounded-t-full outline-none focus-visible:ring-1 focus-visible:ring-accent",
                      isToday ? "bg-accent" : "bg-seq-2",
                    )}
                  />
                  <span className={cn("text-[11px]", isToday ? "text-ink" : "text-muted")}>{d.label}</span>
                </div>
              );
            })}
          </div>

          <p className="meta mb-3 mt-10 text-sm">주제별로 보면</p>
          {/* 얇은 누적 막대 — 조각 사이 2px 종이 틈 */}
          <div className="flex h-[3px] gap-[2px]" aria-hidden>
            {stats.byCategory.map((c) => (
              <motion.span
                key={c.id}
                className={cn("h-full rounded-full", categoryClasses[c.id].dot)}
                initial={{ flexGrow: 0 }}
                whileInView={{ flexGrow: c.hours }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ flexBasis: 0 }}
              />
            ))}
          </div>
          {/* 범례 겸 직접 라벨 */}
          <ul className="mt-4 space-y-1.5 text-sm">
            {stats.byCategory.map((c) => (
              <li key={c.id} className="leader">
                <span className={cn("size-[7px] shrink-0 -translate-y-[0.1em] rounded-full", categoryClasses[c.id].dot)} />
                <span className="text-ink-soft">{categories[c.id].name}</span>
                <span className="dots" aria-hidden />
                <span className="tabular-nums text-muted">
                  {c.hours}시간 <span className="text-faint">·</span> {Math.round((c.hours / catTotal) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <AnimatePresence>
          {tip && (
            <motion.div
              key="tip"
              role="status"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-xs text-paper"
              style={{ left: tip.x, top: tip.y }}
            >
              {tip.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="sr-only">
        지난 {stats.weeks.length}주 동안 {stats.activeDays}일 공부했고, 총 {stats.totalHours}시간입니다. 연속 {stats.streak}일째 공부 중입니다.
      </p>
    </section>
  );
}
