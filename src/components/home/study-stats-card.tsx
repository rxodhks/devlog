"use client";

import * as React from "react";
import { animate, motion, useInView } from "framer-motion";
import { Activity, Flame, TrendingUp } from "lucide-react";

import { BentoCard, CardHeader } from "@/components/home/bento-card";
import { categories, categoryClasses } from "@/lib/site";
import type { StudyStats } from "@/lib/study-data";
import { cn } from "@/lib/utils";

function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (node.textContent = v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [inView, value, decimals]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toFixed(decimals)}
    </span>
  );
}

const LEVEL_CLASS = [
  "bg-surface-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-cyan shadow-[0_0_6px_rgb(var(--cyan)/0.6)]",
];

export function StudyStatsCard({ stats, index }: { stats: StudyStats; index: number }) {
  const max = Math.max(...stats.weekly.map((d) => d.hours));
  const delta = ((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100;
  const totalCat = stats.byCategory.reduce((a, b) => a + b.hours, 0);
  const todayIdx = stats.weekly.length - 1;

  return (
    <BentoCard index={index} className="p-6 md:col-span-2 lg:row-span-2">
      <div className="flex h-full flex-col">
        <CardHeader icon={Activity} eyebrow="Study Stats" title="이번 주 학습 기록" />

        {/* KPI */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-surface-muted/60 p-3.5">
            <p className="text-xs text-muted">This week</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              <CountUp value={stats.thisWeek} decimals={1} />
              <span className="ml-0.5 text-sm font-medium text-muted">h</span>
            </p>
          </div>
          <div className="rounded-2xl bg-surface-muted/60 p-3.5">
            <p className="flex items-center gap-1 text-xs text-muted">
              <Flame className="size-3.5 text-warning" /> Streak
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight">
              <CountUp value={stats.streak} />
              <span className="ml-0.5 text-sm font-medium text-muted">days</span>
            </p>
          </div>
          <div className="rounded-2xl bg-surface-muted/60 p-3.5">
            <p className="flex items-center gap-1 text-xs text-muted">
              <TrendingUp className="size-3.5 text-success" /> vs last
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-success">
              +<CountUp value={delta} />%
            </p>
          </div>
        </div>

        {/* Weekly bars */}
        <div className="mt-6 flex h-28 items-end gap-2.5">
          {stats.weekly.map((d, i) => (
            <div key={d.day} className="group/bar flex flex-1 flex-col items-center gap-1.5">
              <span className="font-mono text-[10px] text-muted opacity-0 transition-opacity group-hover/bar:opacity-100">
                {d.hours}h
              </span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${(d.hours / max) * 76}px` }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 120, damping: 18 }}
                className={cn(
                  "w-full rounded-lg",
                  i === todayIdx ? "bg-brand-gradient shadow-glow" : "bg-primary/25 group-hover/bar:bg-primary/45",
                )}
              />
              <span className={cn("font-mono text-[10px]", i === todayIdx ? "text-foreground" : "text-muted")}>
                {d.day}
              </span>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted">
            <span>최근 {stats.heatmap.length}주 활동</span>
            <span className="flex items-center gap-1">
              Less
              {LEVEL_CLASS.map((c, i) => (
                <span key={i} className={cn("size-2.5 rounded-[3px]", c)} />
              ))}
              More
            </span>
          </div>
          <div className="flex gap-[3px] overflow-hidden">
            {stats.heatmap.map((week, w) => (
              <div key={w} className="flex flex-1 flex-col gap-[3px]">
                {week.map((level, d) => (
                  <motion.span
                    key={d}
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: w * 0.015 + d * 0.01, duration: 0.25 }}
                    className={cn("aspect-square w-full rounded-[3px]", LEVEL_CLASS[level])}
                    title={`level ${level}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Category split */}
        <div className="mt-auto pt-6">
          <div className="flex h-2 overflow-hidden rounded-full">
            {stats.byCategory.map((c) => (
              <motion.span
                key={c.id}
                initial={{ width: 0 }}
                whileInView={{ width: `${(c.hours / totalCat) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={cn("h-full first:rounded-l-full last:rounded-r-full", categoryClasses[c.id].bg)}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {stats.byCategory.map((c) => (
              <span key={c.id} className="flex items-center gap-1.5">
                <span className={cn("size-1.5 rounded-full", categoryClasses[c.id].bg)} />
                {categories[c.id].short} <span className="font-mono text-foreground/80">{c.hours}h</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
