import { AlertTriangle, Info, Lightbulb, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const VARIANTS = {
  info: { icon: Info, className: "border-primary/30 bg-primary/[0.06]", iconClass: "text-primary", label: "Note" },
  tip: { icon: Lightbulb, className: "border-success/30 bg-success/[0.06]", iconClass: "text-success", label: "Tip" },
  warn: { icon: AlertTriangle, className: "border-warning/35 bg-warning/[0.07]", iconClass: "text-warning", label: "Caution" },
  perf: { icon: Zap, className: "border-cyan/30 bg-cyan/[0.06]", iconClass: "text-cyan", label: "Performance" },
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
  const Icon = v.icon;
  return (
    <aside className={cn("my-7 flex gap-3 rounded-2xl border px-4 py-3.5 sm:px-5", v.className)}>
      <Icon className={cn("mt-1 size-[18px] shrink-0", v.iconClass)} />
      <div className="min-w-0 text-[0.95em] [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>p]:my-2">
        <p className={cn("!mb-1 font-mono text-[11px] font-semibold uppercase tracking-wider", v.iconClass)}>
          {title ?? v.label}
        </p>
        {children}
      </div>
    </aside>
  );
}
