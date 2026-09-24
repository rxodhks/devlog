"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Timer } from "lucide-react";

import { cn } from "@/lib/utils";

type Cell = string | number | boolean | null;
type Tab = "code" | "result";

interface SqlResultContextValue {
  id: string;
  tab: Tab;
  setTab: (tab: Tab) => void;
  result: React.ReactNode;
}

const SqlResultContext = React.createContext<SqlResultContextValue | null>(null);

/** CodeBlock 이 SqlResult 내부에 있는지 확인하고 탭 상태를 공유합니다. */
export function useSqlResult() {
  return React.useContext(SqlResultContext);
}

export interface SqlResultProps {
  columns: string[];
  rows: Cell[][];
  /** 목업 실행 시간 (예: "0.012s") */
  time?: string;
  /** 결과 그리드 상단에 표시할 DB 엔진 라벨 */
  engine?: string;
  /** 강조할 행 인덱스 (0-based) */
  highlight?: number[];
  defaultTab?: Tab;
  children: React.ReactNode;
}

/**
 * MDX 사용 예:
 * <SqlResult columns={["dept", "avg"]} rows={[["Eng", 7200]]} time="0.004s">
 *   ```sql
 *   SELECT ...
 *   ```
 * </SqlResult>
 */
export function SqlResult({
  columns,
  rows,
  time = "0.008s",
  engine = "PostgreSQL 16",
  highlight = [],
  defaultTab = "code",
  children,
}: SqlResultProps) {
  const id = React.useId();
  const [tab, setTab] = React.useState<Tab>(defaultTab);
  const [runKey, setRunKey] = React.useState(0);

  const handleSetTab = React.useCallback((next: Tab) => {
    setTab(next);
    if (next === "result") setRunKey((k) => k + 1);
  }, []);

  const result = (
    <ResultGrid
      key={runKey}
      columns={columns}
      rows={rows}
      time={time}
      engine={engine}
      highlight={highlight}
    />
  );

  return (
    <SqlResultContext.Provider value={{ id, tab, setTab: handleSetTab, result }}>
      {children}
    </SqlResultContext.Provider>
  );
}

function ResultGrid({
  columns,
  rows,
  time,
  engine,
  highlight,
}: Required<Pick<SqlResultProps, "columns" | "rows" | "time" | "engine" | "highlight">>) {
  // 짧은 "실행 중" 상태로 실행 느낌을 주는 마이크로 인터랙션
  const [running, setRunning] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setRunning(false), 420);
    return () => clearTimeout(t);
  }, []);

  const numericLike = (cell: Cell) =>
    typeof cell === "number" || (typeof cell === "string" && /^-?\d+(\.\d+)?$/.test(cell));
  const isNumeric = (col: number) => rows.every((r) => r[col] === null || numericLike(r[col]));

  return (
    <div className="font-mono text-[12.5px]">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2 text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success shadow-[0_0_8px_rgb(var(--success))]" />
          {engine} · sandbox
        </span>
        <span>{columns.length} columns</span>
      </div>

      <div className="relative max-h-[420px] overflow-auto">
        {running ? (
          <div className="flex h-40 items-center justify-center gap-2 text-muted">
            <Loader2 className="size-4 animate-spin text-primary" />
            Executing query…
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead className="sticky top-0 z-10 bg-[rgb(var(--code-header))]">
              <tr>
                <th className="w-10 border-b border-r border-border px-3 py-2 text-right text-[10.5px] font-medium text-muted/70">
                  #
                </th>
                {columns.map((c, i) => (
                  <th
                    key={c}
                    className={cn(
                      "border-b border-r border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-foreground/80 last:border-r-0",
                      isNumeric(i) && "text-right",
                    )}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <motion.tr
                  key={r}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: r * 0.035, duration: 0.25 }}
                  className={cn(
                    "transition-colors hover:bg-primary/[0.06]",
                    highlight.includes(r) && "bg-success/[0.08] hover:bg-success/[0.12]",
                  )}
                >
                  <td className="border-b border-r border-border/60 px-3 py-1.5 text-right text-[11px] text-muted/60">
                    {r + 1}
                  </td>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={cn(
                        "whitespace-nowrap border-b border-r border-border/60 px-3 py-1.5 last:border-r-0",
                        numericLike(cell) && "text-right tabular-nums text-cat-network",
                        highlight.includes(r) && "font-semibold",
                      )}
                    >
                      {cell === null ? (
                        <span className="italic text-muted/60">NULL</span>
                      ) : typeof cell === "boolean" ? (
                        <span className={cell ? "text-success" : "text-danger"}>{String(cell)}</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border bg-[rgb(var(--code-header))] px-4 py-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5 text-success">
          <CheckCircle2 className="size-3.5" />
          {running ? "running" : `${rows.length} rows returned`}
        </span>
        <span className="inline-flex items-center gap-1 text-muted">
          <Timer className="size-3.5" />
          {running ? "…" : time}
        </span>
      </div>
    </div>
  );
}
