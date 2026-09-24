"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { calculators, fromSlider, toSlider } from "@/lib/calculators";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  block: boolean;
  formulaHtml: string;
  popoverFormulaHtml: string;
  variableHtml: Record<string, string>;
  outputHtml: Record<string, string>;
}

export function MathCalcClient({ id, block, formulaHtml, popoverFormulaHtml, variableHtml, outputHtml }: Props) {
  const calc = calculators[id];
  const defaults = React.useMemo(
    () => Object.fromEntries(calc.variables.map((v) => [v.key, v.defaultValue])),
    [calc],
  );
  const [values, setValues] = React.useState<Record<string, number>>(defaults);

  const results = calc.outputs.map((o) => ({ ...o, value: o.compute(values) }));
  const bars = results.filter((r) => r.bar);
  const barMax = Math.max(...bars.map((b) => (calc.logBars ? Math.log10(b.value + 1) : b.value)), 1e-9);

  const trigger = (
    <PopoverTrigger asChild>
      <button
        type="button"
        className={cn(
          "group/math relative cursor-pointer text-left transition-colors duration-300",
          block
            ? "my-10 flex w-full flex-col items-center gap-3 [&_.katex-display]:!m-0 [&_.katex-display]:!p-0 [&_.katex-display]:after:!content-none"
            : "mx-0.5 inline-flex items-baseline border-b border-dotted border-accent/70 px-0.5 hover:border-solid hover:bg-accent-soft/40",
        )}
        aria-label={`${calc.title} — 값을 바꿔 보는 작은 계산기 열기`}
      >
        <span dangerouslySetInnerHTML={{ __html: formulaHtml }} />
        {block && (
          <span className="font-serif text-sm italic text-muted transition-colors group-hover/math:text-accent">
            식을 눌러 값을 바꿔 보세요
          </span>
        )}
      </button>
    </PopoverTrigger>
  );

  return (
    <Popover>
      {trigger}
      <PopoverContent className="w-[min(92vw,360px)] p-0" align={block ? "center" : "start"}>
        <div className="px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="meta text-sm">작은 계산기</p>
              <p className="mt-1 font-serif text-[1.05rem] text-ink">{calc.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setValues(defaults)}
              className="ink-link shrink-0 pt-0.5 text-xs text-muted hover:text-ink"
            >
              처음 값으로
            </button>
          </div>
          <div
            className="mt-4 overflow-x-auto text-[13px] [&_.katex-display]:!m-0 [&_.katex-display]:!p-0"
            dangerouslySetInnerHTML={{ __html: popoverFormulaHtml }}
          />
          <p className="mt-3 text-xs leading-relaxed text-muted">{calc.description}</p>
        </div>

        {/* ── 변수 ── */}
        <div className="space-y-4 border-t border-rule px-5 py-4">
          {calc.variables.map((v) => (
            <label key={v.key} className="block">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted">
                  <span className="text-ink" dangerouslySetInnerHTML={{ __html: variableHtml[v.key] }} />
                  {v.label}
                </span>
                <span className="font-mono tabular-nums text-ink">
                  {(v.format ?? String)(values[v.key])}
                  {v.unit && <span className="ml-0.5 text-muted">{v.unit}</span>}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={1}
                value={toSlider(v, values[v.key])}
                onChange={(e) => setValues((prev) => ({ ...prev, [v.key]: fromSlider(v, Number(e.target.value)) }))}
                className="range-input"
                style={{ "--fill": `${toSlider(v, values[v.key]) / 10}%` } as React.CSSProperties}
              />
            </label>
          ))}
        </div>

        {/* ── 결과 ── */}
        <div className="space-y-2.5 border-t border-rule bg-paper-deep/50 px-5 py-4">
          {results.map((r) => (
            <div key={r.key}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-2 text-muted">
                  {outputHtml[r.key] && (
                    <span className="text-ink-soft" dangerouslySetInnerHTML={{ __html: outputHtml[r.key] }} />
                  )}
                  {r.label}
                </span>
                <span className={cn("font-mono tabular-nums", r.emphasis ? "text-sm text-accent" : "text-ink")}>
                  {r.format(r.value)}
                </span>
              </div>
              {r.bar && (
                <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-rule">
                  <motion.div
                    className={cn("h-full rounded-full", r.emphasis ? "bg-accent" : "bg-ink-soft/50")}
                    initial={false}
                    animate={{
                      width: `${Math.max(2, ((calc.logBars ? Math.log10(r.value + 1) : r.value) / barMax) * 100)}%`,
                    }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              )}
            </div>
          ))}
          {calc.footnote && <p className="pt-1 font-serif text-[11.5px] italic leading-relaxed text-muted">{calc.footnote}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
