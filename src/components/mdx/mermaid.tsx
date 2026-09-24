"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type MermaidAPI = typeof import("mermaid").default;

let mermaidPromise: Promise<MermaidAPI> | null = null;
/** mermaid(~수백 KB)는 다이어그램이 있는 페이지에서만 지연 로드 */
function loadMermaid() {
  mermaidPromise ??= import("mermaid").then((m) => m.default);
  return mermaidPromise;
}

const FONT = '"Pretendard Variable", Pretendard, sans-serif';

/** 종이와 잉크: 채움은 거의 없이, 선은 가늘게 */
function themeVariables(dark: boolean) {
  const c = dark
    ? { paper: "#161513", deep: "#1E1D1A", raised: "#24221F", ink: "#ECE7DC", soft: "#CFC9BC", muted: "#9B958A", rule: "#403D37", accent: "#A3BFA7", note: "#2E3A30" }
    : { paper: "#F5F3EE", deep: "#ECE9E2", raised: "#FBFAF7", ink: "#23211D", soft: "#3B3833", muted: "#6B665C", rule: "#C9C3B6", accent: "#4A6650", note: "#E3EADF" };
  return {
    darkMode: dark,
    fontFamily: FONT,
    fontSize: "14px",
    background: "transparent",
    primaryColor: c.raised,
    primaryTextColor: c.ink,
    primaryBorderColor: c.muted,
    secondaryColor: c.deep,
    secondaryBorderColor: c.rule,
    secondaryTextColor: c.ink,
    tertiaryColor: c.paper,
    tertiaryBorderColor: c.rule,
    lineColor: c.muted,
    textColor: c.soft,
    mainBkg: c.raised,
    nodeBorder: c.muted,
    clusterBkg: "transparent",
    clusterBorder: c.rule,
    titleColor: c.muted,
    edgeLabelBackground: c.deep,
    actorBkg: c.raised,
    actorBorder: c.muted,
    actorTextColor: c.ink,
    actorLineColor: c.rule,
    signalColor: c.muted,
    signalTextColor: c.ink,
    labelBoxBkgColor: c.raised,
    labelBoxBorderColor: c.muted,
    labelTextColor: c.ink,
    loopTextColor: c.muted,
    noteBkgColor: c.note,
    noteBorderColor: c.accent,
    noteTextColor: c.ink,
    activationBkgColor: c.deep,
    activationBorderColor: c.muted,
    attributeBackgroundColorOdd: c.raised,
    attributeBackgroundColorEven: c.deep,
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
          flowchart: { curve: "basis", padding: 16, htmlLabels: true, nodeSpacing: 40, rankSpacing: 46 },
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
    <div className="grid h-48 place-items-center">
      <span className="size-1.5 animate-breathe rounded-full bg-accent" />
    </div>
  );

  return (
    <figure className="not-prose mermaid-figure my-12">
      <div className="rounded-xl bg-paper-deep/60 px-4 py-8 sm:px-8">{body}</div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-sm">
        <span className="font-serif italic text-muted">
          <span className="figure-number" />
          {caption ?? kind}
        </span>
        <Dialog>
          <DialogTrigger
            disabled={!svg}
            className="ink-link shrink-0 text-muted transition-colors hover:text-ink disabled:opacity-40"
            aria-label="다이어그램 크게 보기"
          >
            크게 보기
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="mb-6 font-serif text-base font-normal italic text-muted">{caption ?? kind}</DialogTitle>
            <div
              className="flex justify-center [&_svg]:h-auto [&_svg]:!max-w-none [&_svg]:min-w-[min(100%,900px)]"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </DialogContent>
        </Dialog>
      </figcaption>
    </figure>
  );
}
