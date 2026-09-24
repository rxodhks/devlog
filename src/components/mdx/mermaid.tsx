"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Maximize2, Workflow } from "lucide-react";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type MermaidAPI = typeof import("mermaid").default;

let mermaidPromise: Promise<MermaidAPI> | null = null;
/** mermaid(~수백 KB)는 다이어그램이 있는 페이지에서만 지연 로드 */
function loadMermaid() {
  mermaidPromise ??= import("mermaid").then((m) => m.default);
  return mermaidPromise;
}

const FONT = '"Pretendard Variable", Pretendard, "Inter Variable", sans-serif';

function themeVariables(dark: boolean) {
  return dark
    ? {
        darkMode: true,
        fontFamily: FONT,
        fontSize: "14px",
        background: "#0B101C",
        primaryColor: "#15213A",
        primaryTextColor: "#E5E7EB",
        primaryBorderColor: "#3B82F6",
        secondaryColor: "#0E2A33",
        secondaryBorderColor: "#06B6D4",
        secondaryTextColor: "#E5E7EB",
        tertiaryColor: "#111827",
        tertiaryBorderColor: "#334155",
        lineColor: "#64748B",
        textColor: "#CBD5E1",
        mainBkg: "#15213A",
        nodeBorder: "#3B82F6",
        clusterBkg: "#0F172A",
        clusterBorder: "#1F2937",
        edgeLabelBackground: "#0B101C",
        actorBkg: "#15213A",
        actorBorder: "#3B82F6",
        actorTextColor: "#E5E7EB",
        actorLineColor: "#475569",
        signalColor: "#94A3B8",
        signalTextColor: "#E5E7EB",
        labelBoxBkgColor: "#15213A",
        labelBoxBorderColor: "#3B82F6",
        labelTextColor: "#E5E7EB",
        loopTextColor: "#94A3B8",
        noteBkgColor: "#10231F",
        noteBorderColor: "#10B981",
        noteTextColor: "#D1FAE5",
        activationBkgColor: "#1E3A5F",
        activationBorderColor: "#3B82F6",
        attributeBackgroundColorOdd: "#111827",
        attributeBackgroundColorEven: "#0B101C",
      }
    : {
        darkMode: false,
        fontFamily: FONT,
        fontSize: "14px",
        background: "#F8FAFC",
        primaryColor: "#EFF6FF",
        primaryTextColor: "#0F172A",
        primaryBorderColor: "#3B82F6",
        secondaryColor: "#ECFEFF",
        secondaryBorderColor: "#06B6D4",
        tertiaryColor: "#FFFFFF",
        tertiaryBorderColor: "#CBD5E1",
        lineColor: "#94A3B8",
        textColor: "#334155",
        mainBkg: "#EFF6FF",
        nodeBorder: "#3B82F6",
        clusterBkg: "#F8FAFC",
        clusterBorder: "#E2E8F0",
        edgeLabelBackground: "#F8FAFC",
        actorBkg: "#EFF6FF",
        actorBorder: "#3B82F6",
        actorTextColor: "#0F172A",
        actorLineColor: "#CBD5E1",
        signalColor: "#64748B",
        signalTextColor: "#0F172A",
        noteBkgColor: "#ECFDF5",
        noteBorderColor: "#10B981",
        noteTextColor: "#064E3B",
        activationBkgColor: "#DBEAFE",
        activationBorderColor: "#3B82F6",
        attributeBackgroundColorOdd: "#FFFFFF",
        attributeBackgroundColorEven: "#F8FAFC",
      };
}

let renderCount = 0;

export function Mermaid({ chart, caption }: { chart: string; caption?: string }) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  const kind = chart.trim().split(/\s|\n/)[0] ?? "diagram";

  React.useEffect(() => {
    if (!resolvedTheme) return;
    let cancelled = false;

    (async () => {
      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: themeVariables(resolvedTheme === "dark"),
          flowchart: { curve: "basis", padding: 14, htmlLabels: true },
          sequence: { mirrorActors: false, messageAlign: "center" },
          er: { layoutDirection: "TB" },
        });
        const { svg } = await mermaid.render(`mermaid-${++renderCount}`, chart.trim());
        if (!cancelled) {
          setSvg(svg);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme]);

  // mermaid 는 svg 를 width=100% 로 만들어 넓은 다이어그램이 지나치게 작아질 수 있습니다.
  // → 컨테이너에 맞추되 원래 크기의 70% 밑으로는 줄이지 않고, 그보다 넓으면 가로 스크롤.
  const svgRef = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    const el = svgRef.current?.querySelector("svg");
    const container = svgRef.current?.parentElement;
    if (!el || !container) return;
    const natural = parseFloat(el.style.maxWidth);
    if (!Number.isFinite(natural) || natural <= 0) return;
    const width = Math.min(natural, Math.max(container.clientWidth, natural * 0.7));
    el.style.width = `${width}px`;
    el.style.maxWidth = "none";
  }, [svg]);

  const body = error ? (
    <pre className="overflow-x-auto p-4 font-mono text-xs text-danger">{error}</pre>
  ) : svg ? (
    <div className="overflow-x-auto">
      <div
        ref={svgRef}
        className="mx-auto w-fit [&_svg]:h-auto"
        // mermaid securityLevel=strict 로 sanitize 된 SVG
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  ) : (
    <div className="h-56 animate-shimmer rounded-xl bg-[linear-gradient(90deg,transparent,rgb(var(--primary)/0.08),transparent)] bg-[length:200%_100%]" />
  );

  return (
    <figure className="not-prose group/mermaid my-8 overflow-hidden rounded-2xl border border-border bg-[rgb(var(--code-bg))]">
      <div className="flex h-11 items-center justify-between border-b border-border bg-[rgb(var(--code-header))] pl-4 pr-2">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
          <Workflow className="size-3.5 text-cyan" />
          mermaid · {kind}
        </span>
        <Dialog>
          <DialogTrigger
            disabled={!svg}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 font-mono text-[11px] text-muted transition-colors hover:bg-surface/70 hover:text-foreground disabled:opacity-40"
            aria-label="다이어그램 크게 보기"
          >
            <Maximize2 className="size-3.5" />
            <span className="hidden sm:inline">Expand</span>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="mb-4 font-mono text-xs uppercase tracking-wider text-muted">
              {caption ?? `mermaid · ${kind}`}
            </DialogTitle>
            <div
              className="flex justify-center [&_svg]:h-auto [&_svg]:!max-w-none [&_svg]:min-w-[min(100%,900px)]"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="p-5 sm:p-8">{body}</div>
      {caption && (
        <figcaption className="border-t border-border/70 px-4 py-2.5 text-center text-xs text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
