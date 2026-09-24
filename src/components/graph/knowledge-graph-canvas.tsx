"use client";

import * as React from "react";
import ForceGraph2D, { type ForceGraphMethods, type LinkObject, type NodeObject } from "react-force-graph-2d";
import { forceCollide, forceX, forceY } from "d3-force";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { hrefForNode, type GraphLink, type GraphNode, type KnowledgeGraphData } from "@/lib/graph";
import { categories } from "@/lib/site";
import type { CategoryId } from "@/types/post";

type FGNode = NodeObject<GraphNode>;
type FGLink = LinkObject<GraphNode, GraphLink>;

export interface KnowledgeGraphCanvasProps {
  data: KnowledgeGraphData;
  variant?: "preview" | "full";
  selectedId?: string | null;
  hiddenCategories?: ReadonlySet<CategoryId>;
  /** 지정하면 노드 클릭 시 네비게이션 대신 콜백 호출 (post 노드는 항상 이동) */
  onSelect?: (node: GraphNode | null) => void;
  onHover?: (node: GraphNode | null) => void;
}

/** 시뮬레이션 시작 후 link.source/target 은 id 문자열 → 노드 객체로 바뀝니다. */
const idOf = (end: unknown) =>
  typeof end === "object" && end !== null ? String((end as { id?: string | number }).id) : String(end);

export default function KnowledgeGraphCanvas({
  data,
  variant = "full",
  selectedId = null,
  hiddenCategories,
  onSelect,
  onHover,
}: KnowledgeGraphCanvasProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  const isPreview = variant === "preview";

  const containerRef = React.useRef<HTMLDivElement>(null);
  const fgRef = React.useRef<ForceGraphMethods<FGNode, FGLink> | undefined>(undefined);
  const fittedRef = React.useRef(false);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [fontsReady, setFontsReady] = React.useState(false);

  // force-graph 는 노드/링크 객체를 직접 변형(x, y, source→object)하므로 복제해서 넘깁니다.
  const graphData = React.useMemo(
    () => ({
      nodes: data.nodes.map((n) => ({ ...n })) as FGNode[],
      links: data.links.map((l) => ({ ...l })) as FGLink[],
    }),
    [data],
  );

  const neighbors = React.useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const l of data.links) {
      if (!map.has(l.source)) map.set(l.source, new Set());
      if (!map.has(l.target)) map.set(l.target, new Set());
      map.get(l.source)!.add(l.target);
      map.get(l.target)!.add(l.source);
    }
    return map;
  }, [data]);

  // 숨김 카테고리 → 보이는 노드 집합
  const visible = React.useMemo(() => {
    const set = new Set<string>();
    const hidden = hiddenCategories ?? new Set<CategoryId>();
    const visiblePosts = new Set(
      data.nodes.filter((n) => n.kind === "post" && !hidden.has(n.category!)).map((n) => n.slug!),
    );
    for (const n of data.nodes) {
      if (n.kind === "post" && visiblePosts.has(n.slug!)) set.add(n.id);
      if (n.kind === "category" && !hidden.has(n.category!)) set.add(n.id);
      if (n.kind === "tag" && n.posts.some((s) => visiblePosts.has(s))) set.add(n.id);
    }
    return set;
  }, [data, hiddenCategories]);

  const focusId = hoverId ?? selectedId;
  const highlight = React.useMemo(() => {
    if (!focusId) return null;
    return new Set([focusId, ...(neighbors.get(focusId) ?? [])]);
  }, [focusId, neighbors]);

  /* ── 반응형 캔버스 크기 ── */
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── 캔버스 라벨용 폰트 선로딩 ──
     Pretendard dynamic-subset 은 글자가 DOM에 쓰일 때 해당 조각만 받아오므로,
     캔버스에 그리기 전에 라벨 글자들을 명시적으로 로드해야 fallback 폰트가 섞이지 않습니다. */
  React.useEffect(() => {
    const text = data.nodes.map((n) => `#${n.label}`).join(" ");
    const weights = [500, 600, 700];
    Promise.all(weights.map((w) => document.fonts.load(`${w} 12px "Pretendard Variable"`, text)))
      .catch(() => undefined)
      .finally(() => setFontsReady(true));
  }, [data]);

  /* ── d3-force 튜닝: 반발력 + 중심 인력 + 충돌(라벨 겹침 완화) ── */
  const fitPadding = isPreview ? 36 : 70;
  React.useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(isPreview ? -70 : -120);
    fg.d3Force("link")?.distance((l: FGLink) =>
      l.kind === "category-post" ? (isPreview ? 36 : 54) : l.kind === "post-post" ? 70 : isPreview ? 24 : 34,
    );
    fg.d3Force("x", forceX(0).strength(isPreview ? 0.09 : 0.06));
    fg.d3Force("y", forceY(0).strength(isPreview ? 0.12 : 0.07));
    fg.d3Force(
      "collide",
      forceCollide<FGNode>((n) => Math.sqrt(n.val) * (isPreview ? 2.4 : 3) + (isPreview ? 9 : 14)),
    );
    fg.d3ReheatSimulation();
    const t = setTimeout(() => fg.zoomToFit(600, fitPadding), 1100);
    return () => clearTimeout(t);
  }, [isPreview, size.width, fitPadding]);

  /* ── 선택된 노드로 카메라 이동 ── */
  React.useEffect(() => {
    if (!selectedId || isPreview) return;
    const node = graphData.nodes.find((n) => n.id === selectedId);
    if (node?.x === undefined || node.y === undefined) return;
    fgRef.current?.centerAt(node.x, node.y, 700);
    fgRef.current?.zoom(2.2, 700);
  }, [selectedId, graphData, isPreview]);

  const colorOf = React.useCallback(
    (node: GraphNode) => (node.category ? categories[node.category].hex[dark ? "dark" : "light"] : "#94A3B8"),
    [dark],
  );

  const palette = dark
    ? { text: "#E5E7EB", muted: "#94A3B8", halo: "#090D16", link: "rgba(148,163,184,0.16)", linkHi: "#22D3EE" }
    : { text: "#0F172A", muted: "#475569", halo: "#FAFAFA", link: "rgba(71,85,105,0.18)", linkHi: "#0891B2" };

  const radiusOf = (node: GraphNode) => Math.sqrt(node.val) * (isPreview ? 2.4 : 3);

  const drawNode = React.useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, scale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = radiusOf(node);
      const color = colorOf(node);
      const isFocus = node.id === focusId;
      const isHi = highlight?.has(String(node.id)) ?? false;
      const dimmed = highlight !== null && !isHi;

      ctx.save();
      ctx.globalAlpha = dimmed ? 0.12 : 1;

      // 선택/호버 링
      if (isFocus) {
        ctx.beginPath();
        ctx.arc(x, y, r + 4 / scale + 2, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1.5 / scale;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.shadowColor = color;
      ctx.shadowBlur = node.kind === "category" || isHi ? 18 : 6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);

      if (node.kind === "tag") {
        ctx.fillStyle = palette.halo;
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = color;
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.globalAlpha *= node.kind === "post" ? 0.9 : 1;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // 라벨 정책
      // - preview: 카테고리·포스트는 항상, 태그는 하이라이트(호버)될 때만 → 작은 카드에서 겹침 방지
      // - full: 카테고리는 항상, 태그·포스트는 적당히 확대했거나 하이라이트될 때
      const showLabel = isPreview
        ? node.kind !== "tag" || isHi
        : node.kind === "category" || isHi || scale > 0.85;
      if (showLabel) {
        const base = node.kind === "category" ? 13 : node.kind === "post" ? 11.5 : 10.5;
        const px = isPreview ? base - 0.5 : base;
        const weight = node.kind === "category" ? 700 : node.kind === "post" ? 600 : 500;
        const label = node.kind === "tag" ? `#${node.label}` : node.label;
        // 라벨은 화면 좌표계(1/scale)로 그려야 작은 폰트가 확대될 때 자간이 깨지지 않습니다.
        ctx.save();
        ctx.translate(x, y + r + 2 / scale + 1);
        ctx.scale(1 / scale, 1 / scale);
        ctx.font = `${weight} ${px}px "Pretendard Variable", Pretendard, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = palette.halo;
        ctx.globalAlpha = dimmed ? 0.12 : 1;
        ctx.strokeText(label, 0, 0);
        ctx.fillStyle = node.kind === "tag" ? palette.muted : palette.text;
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colorOf, focusId, highlight, isPreview, dark, fontsReady],
  );

  const paintPointerArea = React.useCallback(
    (node: FGNode, color: string, ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, radiusOf(node) + 4, 0, 2 * Math.PI);
      ctx.fill();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPreview],
  );

  const isLinkHi = React.useCallback(
    (l: FGLink) => {
      if (!focusId) return false;
      const s = idOf(l.source);
      const t = idOf(l.target);
      return s === focusId || t === focusId;
    },
    [focusId],
  );

  const handleClick = (node: FGNode) => {
    const n = node as GraphNode;
    if (onSelect && n.kind !== "post") {
      onSelect(n);
      return;
    }
    router.push(hrefForNode(n));
  };

  return (
    <div ref={containerRef} className="absolute inset-0">
      {size.width > 0 && (
        <ForceGraph2D<GraphNode, GraphLink>
          ref={fgRef}
          width={size.width}
          height={size.height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          nodeLabel={() => ""}
          nodeCanvasObject={drawNode}
          nodeCanvasObjectMode={() => "replace"}
          nodePointerAreaPaint={paintPointerArea}
          nodeVisibility={(n) => visible.has(String(n.id))}
          linkVisibility={(l) => visible.has(idOf(l.source)) && visible.has(idOf(l.target))}
          linkColor={(l) => (isLinkHi(l) ? palette.linkHi : palette.link)}
          linkWidth={(l) => (isLinkHi(l) ? 2 : l.kind === "category-post" ? 1.2 : 0.8)}
          linkLineDash={(l) => (l.kind === "post-post" ? [3, 3] : null)}
          linkDirectionalParticles={(l) => (isLinkHi(l) ? 3 : 0)}
          linkDirectionalParticleWidth={2.4}
          linkDirectionalParticleSpeed={0.008}
          linkDirectionalParticleColor={() => palette.linkHi}
          d3VelocityDecay={0.34}
          d3AlphaDecay={0.03}
          minZoom={0.4}
          maxZoom={6}
          enableZoomInteraction={!isPreview}
          enablePanInteraction={!isPreview}
          onEngineStop={() => {
            if (fittedRef.current) return;
            fittedRef.current = true;
            fgRef.current?.zoomToFit(600, fitPadding);
          }}
          onNodeHover={(n) => {
            const id = n ? String(n.id) : null;
            setHoverId(id);
            onHover?.((n as GraphNode | null) ?? null);
            if (containerRef.current) containerRef.current.style.cursor = n ? "pointer" : "default";
          }}
          onNodeClick={handleClick}
          onBackgroundClick={() => onSelect?.(null)}
        />
      )}
    </div>
  );
}
