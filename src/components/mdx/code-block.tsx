"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Code2, Copy, Table2 } from "lucide-react";

import { useSqlResult } from "@/components/mdx/sql-result";
import { cn } from "@/lib/utils";

/** 언어별 배지 색상 (점 + 라벨) */
const LANG_META: Record<string, { label: string; color: string }> = {
  sql: { label: "SQL", color: "#3B82F6" },
  python: { label: "Python", color: "#F5B301" },
  py: { label: "Python", color: "#F5B301" },
  ts: { label: "TypeScript", color: "#3178C6" },
  tsx: { label: "TSX", color: "#3178C6" },
  typescript: { label: "TypeScript", color: "#3178C6" },
  js: { label: "JavaScript", color: "#F7DF1E" },
  javascript: { label: "JavaScript", color: "#F7DF1E" },
  java: { label: "Java", color: "#F89820" },
  bash: { label: "Bash", color: "#10B981" },
  sh: { label: "Shell", color: "#10B981" },
  shell: { label: "Shell", color: "#10B981" },
  json: { label: "JSON", color: "#94A3B8" },
  diff: { label: "Diff", color: "#EF4444" },
  c: { label: "C", color: "#A8B9CC" },
  plaintext: { label: "Text", color: "#94A3B8" },
  text: { label: "Text", color: "#94A3B8" },
};

interface CodeBlockProps {
  language?: string;
  title?: string;
  children: React.ReactNode;
}

export function CodeBlock({ language = "plaintext", title, children }: CodeBlockProps) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const sql = useSqlResult();
  const meta = LANG_META[language] ?? { label: language.toUpperCase(), color: "#94A3B8" };

  const getCode = React.useCallback(() => {
    const root = bodyRef.current;
    if (!root) return "";
    const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-line]"));
    if (lines.length === 0) return root.innerText;
    // diff에서 삭제(-) 라인은 복사 대상에서 제외
    return lines
      .filter((line) => !line.classList.contains("remove"))
      .map((line) => line.textContent ?? "")
      .join("\n");
  }, []);

  return (
    <div className="not-prose group/code relative my-7 overflow-hidden rounded-2xl border border-border bg-[rgb(var(--code-bg))] shadow-card dark:shadow-none">
      {/* ── Header ─────────────────────────────── */}
      <div className="flex h-11 items-center justify-between gap-3 border-b border-border bg-[rgb(var(--code-header))] pl-4 pr-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface/60 px-2 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-muted">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
            {meta.label}
          </span>
          {title && <span className="truncate font-mono text-xs text-muted">{title}</span>}
        </div>

        <div className="flex items-center gap-1.5">
          {sql && <SqlTabSwitch />}
          <CopyButton getText={getCode} />
        </div>
      </div>

      {/* ── Body ─────────────────────────────────
          코드는 항상 DOM에 유지(결과 탭에서도 복사 가능), 결과 그리드만 마운트/언마운트 */}
      <motion.div
        ref={bodyRef}
        className={cn(sql?.tab === "result" && "hidden")}
        initial={false}
        animate={{ opacity: sql?.tab === "result" ? 0 : 1, y: sql?.tab === "result" ? 6 : 0 }}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.div>
      <AnimatePresence initial={false}>
        {sql?.tab === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {sql.result}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SqlTabSwitch() {
  const sql = useSqlResult();
  if (!sql) return null;

  const tabs = [
    { id: "code" as const, label: "Code", icon: Code2 },
    { id: "result" as const, label: "Execution Result", icon: Table2 },
  ];

  return (
    <div role="tablist" aria-label="SQL 보기 전환" className="flex items-center gap-0.5 rounded-lg border border-border bg-surface/50 p-0.5">
      {tabs.map((t) => {
        const active = sql.tab === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => sql.setTab(t.id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] font-medium transition-colors",
              active ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`sql-tab-${sql.id}`}
                className="absolute inset-0 rounded-md bg-surface-muted ring-1 ring-border"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <t.icon className={cn("relative size-3.5", active && t.id === "result" && "text-success")} />
            <span className="relative hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
    } catch {
      /* clipboard 권한 거부 등 */
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "복사됨" : "코드 복사"}
      className={cn(
        "relative inline-flex h-7 items-center gap-1.5 overflow-hidden rounded-lg border px-2 font-mono text-[11px] transition-colors",
        copied
          ? "border-success/40 bg-success/10 text-success"
          : "border-transparent text-muted hover:border-border hover:bg-surface/70 hover:text-foreground",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <Check className="size-3.5" />
          </motion.span>
        ) : (
          <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Copy className="size-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {copied && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="whitespace-nowrap"
          >
            Copied!
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
