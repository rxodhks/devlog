import { cn } from "@/lib/utils";

/** 여백 메모처럼 — 왼쪽 가는 선 + 이탤릭 머리말. 아이콘과 색 상자는 쓰지 않습니다. */
const VARIANTS = {
  info: { label: "메모", rule: "border-rule-strong", mark: "text-muted" },
  tip: { label: "작은 요령", rule: "border-accent/60", mark: "text-accent" },
  warn: { label: "조심할 점", rule: "border-danger/60", mark: "text-danger" },
  perf: { label: "성능 메모", rule: "border-cat-network/60", mark: "text-ink-soft" },
} as const;

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof VARIANTS;
  title?: string;
  children: React.ReactNode;
}) {
  const v = VARIANTS[type];
  return (
    <aside className={cn("my-9 border-l pl-5", v.rule)}>
      <p className={cn("!mb-1.5 !mt-0 font-serif text-[0.95rem] italic", v.mark)}>
        {title ?? v.label}
      </p>
      <div className="text-[0.97em] text-ink-soft [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>p]:my-2">{children}</div>
    </aside>
  );
}
