"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useSqlResult } from "@/components/mdx/sql-result";
import { cn } from "@/lib/utils";

const LANG_LABEL: Record<string, string> = {
  sql: "SQL",
  python: "Python",
  py: "Python",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  js: "JavaScript",
  javascript: "JavaScript",
  java: "Java",
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  json: "JSON",
  diff: "Diff",
  c: "C",
  plaintext: "Text",
  text: "Text",
};

interface CodeBlockProps {
  language?: string;
  title?: string;
  children: React.ReactNode;
}

/**
 * 조금 더 짙은 종이 위에 적힌 코드.
 * 머리에는 파일 이름(이탤릭)과 언어, 조용한 "복사" 버튼. SQL 이면 "코드 / 실행 결과" 탭.
 */
export function CodeBlock({ language = "plaintext", title, children }: CodeBlockProps) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const sql = useSqlResult();
  const label = LANG_LABEL[language] ?? language;

  const getCode = React.useCallback(() => {
    const root = bodyRef.current;
    if (!root) return "";
    const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-line]"));
    if (lines.length === 0) return root.innerText;
    // diff 에서 지워진(-) 줄은 복사하지 않습니다
    return lines
      .filter((line) => !line.classList.contains("remove"))
      .map((line) => line.textContent ?? "")
      .join("\n");
  }, []);

  return (
    <div className="not-prose group/code relative my-9 overflow-hidden rounded-xl bg-paper-deep">
      <div className="flex items-center justify-between gap-4 px-5 pb-1 pt-3.5 text-[0.8rem]">
        <div className="flex min-w-0 items-baseline gap-3">
          {title && <span className="truncate font-serif text-[0.92rem] italic text-ink-soft">{title}</span>}
          <span className="shrink-0 uppercase tracking-[0.12em] text-muted" style={{ fontSize: "0.68rem" }}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-5">
          {sql && <SqlTabSwitch />}
          <CopyButton getText={getCode} />
        </div>
      </div>

      {/* 코드는 항상 DOM 에 남겨 두어 결과 탭에서도 복사할 수 있게 */}
      <motion.div
        ref={bodyRef}
        className={cn(sql?.tab === "result" && "hidden")}
        initial={false}
        animate={{ opacity: sql?.tab === "result" ? 0 : 1 }}
        transition={{ duration: 0.35 }}
      >
        {children}
      </motion.div>
      <AnimatePresence initial={false}>
        {sql?.tab === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
    { id: "code" as const, label: "코드" },
    { id: "result" as const, label: "실행 결과" },
  ];

  return (
    <div role="tablist" aria-label="SQL 보기 전환" className="flex items-center gap-4">
      {tabs.map((t) => {
        const active = sql.tab === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => sql.setTab(t.id)}
            className={cn(
              "relative pb-1 text-[0.8rem] transition-colors duration-300",
              active ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {t.label}
            {active && (
              <motion.span
                layoutId={`sql-tab-${sql.id}`}
                className="absolute inset-x-0 -bottom-px h-px bg-ink"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
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
    const t = setTimeout(() => setCopied(false), 1800);
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
      aria-label={copied ? "복사했어요" : "코드 복사"}
      className="relative h-5 min-w-[3.5rem] overflow-hidden text-right text-[0.8rem] text-muted transition-colors hover:text-ink"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "done" : "idle"}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn("inline-block", copied && "font-serif italic text-accent")}
        >
          {copied ? "복사했어요" : "복사"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
