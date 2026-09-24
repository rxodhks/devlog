"use client";

import * as React from "react";
import { motion } from "framer-motion";

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
  // 잠깐 "실행 중" 상태를 두어 실행하는 느낌을 줍니다
  const [running, setRunning] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setRunning(false), 380);
    return () => clearTimeout(t);
  }, []);

  const numericLike = (cell: Cell) =>
    typeof cell === "number" || (typeof cell === "string" && /^-?\d+(\.\d+)?$/.test(cell));
  const isNumeric = (col: number) => rows.every((r) => r[col] === null || numericLike(r[col]));

  return (
    <div className="px-5 pb-4 pt-3">
      <div className="relative max-h-[420px] overflow-auto">
        {running ? (
          <p className="flex h-36 items-center justify-center gap-2 font-serif text-sm italic text-muted">
            <span className="size-1.5 animate-breathe rounded-full bg-accent" />
            쿼리를 실행하고 있어요…
          </p>
        ) : (
          <table className="w-full border-collapse text-left text-[0.85rem]">
            <thead>
              <tr className="border-b border-rule-strong">
                {columns.map((c, i) => (
                  <th
                    key={c}
                    className={cn(
                      "whitespace-nowrap px-3 pb-2 pt-1 font-serif text-[0.85rem] font-normal italic text-muted first:pl-0",
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: r * 0.04, duration: 0.4 }}
                  className={cn("border-b border-rule last:border-b-0", highlight.includes(r) && "bg-marker/40")}
                >
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className={cn(
                        "whitespace-nowrap px-3 py-2 text-ink-soft first:pl-0",
                        numericLike(cell) && "text-right font-mono text-[0.8rem] tabular-nums text-ink",
                      )}
                    >
                      {cell === null ? (
                        <span className="font-serif italic text-muted">null</span>
                      ) : typeof cell === "boolean" ? (
                        <span className={cell ? "text-success" : "text-danger"}>{cell ? "참" : "거짓"}</span>
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
      <p className="mt-3 flex justify-between gap-4 font-serif text-[0.85rem] italic text-muted">
        <span>{running ? "실행 중" : `${rows.length}행을 돌려받았어요`}</span>
        <span>
          {engine} · {running ? "…" : time}
        </span>
      </p>
    </div>
  );
}
