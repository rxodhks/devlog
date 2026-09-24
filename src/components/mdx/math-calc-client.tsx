"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Calculator as CalculatorIcon, RotateCcw, SlidersHorizontal } from "lucide-react";

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
          "group/math relative cursor-pointer rounded-lg text-left transition-colors",
          block
            ? "my-6 flex w-full items-center justify-center overflow-x-auto rounded-2xl border border-dashed border-primary/40 bg-primary/[0.04] px-4 py-6 hover:border-primary hover:bg-primary/[0.07] [&_.katex-display]:m-0 [&_.katex-display]:border-0 [&_.katex-display]:bg-transparent [&_.katex-display]:p-0"
            : "mx-0.5 inline-flex items-baseline gap-1 border-b border-dashed border-primary/60 px-1 hover:bg-primary/10",
        )}
        aria-label={`${calc.title} 계산기 열기`}
      >
        <span dangerouslySetInnerHTML={{ __html: formulaHtml }} />
        {block ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md border border-primary/30 bg-surface/80 px-1.5 py-0.5 font-mono text-[10px] text-primary">
            <SlidersHorizontal className="size-3" /> interactive
          </span>
        ) : (
          <CalculatorIcon className="size-3 translate-y-[1px] text-primary opacity-60 transition-opacity group-hover/math:opacity-100" />
        )}
      </button>
    </PopoverTrigger>
  );

  return (
    <Popover>
      {trigger}
      <PopoverContent className="w-[min(92vw,380px)] p-0" align={block ? "center" : "start"}>
        <div className="border-b border-border px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="eyebrow text-primary">Mini Calculator</p>
              <p className="mt-1 text-sm font-semibold">{calc.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setValues(defaults)}
              className="rounded-md p-1.5 text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              aria-label="기본값으로 초기화"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
          <div
            className="mt-3 overflow-x-auto rounded-xl bg-surface-muted/70 px-3 py-3 text-[13px] [&_.katex-display]:m-0 [&_.katex-display]:border-0 [&_.katex-display]:bg-transparent [&_.katex-display]:p-0"
            dangerouslySetInnerHTML={{ __html: popoverFormulaHtml }}
          />
          <p className="mt-2 text-xs leading-relaxed text-muted">{calc.description}</p>
        </div>

        {/* ── Variables ── */}
        <div className="space-y-3.5 px-4 py-3.5">
          {calc.variables.map((v) => (
            <label key={v.key} className="block">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted">
                  <span className="text-foreground" dangerouslySetInnerHTML={{ __html: variableHtml[v.key] }} />
                  {v.label}
                </span>
                <span className="font-mono font-semibold tabular-nums text-foreground">
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

        {/* ── Results ── */}
        <div className="space-y-2 border-t border-border bg-surface-muted/40 px-4 py-3.5">
          {results.map((r) => (
            <div key={r.key}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-2 text-muted">
                  {outputHtml[r.key] && (
                    <span className="text-foreground/90" dangerouslySetInnerHTML={{ __html: outputHtml[r.key] }} />
                  )}
                  {r.label}
                </span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    r.emphasis ? "text-sm font-bold text-success" : "font-medium text-foreground",
                  )}
                >
                  {r.format(r.value)}
                </span>
              </div>
              {r.bar && (
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border/60">
                  <motion.div
                    className={cn("h-full rounded-full", r.emphasis ? "bg-success" : "bg-brand-gradient")}
                    initial={false}
                    animate={{
                      width: `${Math.max(2, ((calc.logBars ? Math.log10(r.value + 1) : r.value) / barMax) * 100)}%`,
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 26 }}
                  />
                </div>
              )}
            </div>
          ))}
          {calc.footnote && <p className="pt-1 text-[11px] leading-relaxed text-muted/80">{calc.footnote}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
