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
/** 카테고리 노드는 한글 이름으로 */
const categoryName = (node: GraphNode) => (node.category ? categories[node.category].name : node.label);

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
    const text = data.nodes.map((n) => `#${n.label}`).join(" ") + " 0123456789";
    const faces = [
      '400 12px "Pretendard Variable"',
      '400 12px "Newsreader Variable"',
      '500 12px "Newsreader Variable"',
      '400 12px "Noto Serif KR Variable"',
      '500 12px "Noto Serif KR Variable"',
    ];
    Promise.all(faces.map((f) => document.fonts.load(f, text)))
      .catch(() => undefined)
      .finally(() => setFontsReady(true));
  }, [data]);

  /* ── d3-force 튜닝: 반발력 + 중심 인력 + 충돌(라벨 겹침 완화) ── */
  const fitPadding = isPreview ? 36 : 70;
  React.useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(isPreview ? -80 : -130);
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
    (node: GraphNode) => (node.category ? categories[node.category].hex[dark ? "dark" : "light"] : "#A8A296"),
    [dark],
  );

  // 종이와 잉크 팔레트 (globals.css 토큰과 동일한 값)
  const palette = dark
    ? { ink: "#ECE7DC", muted: "#9B958A", paper: "#161513", link: "rgba(155,149,138,0.22)", linkHi: "#A3BFA7" }
    : { ink: "#23211D", muted: "#6B665C", paper: "#F5F3EE", link: "rgba(107,102,92,0.22)", linkHi: "#4A6650" };

  const radiusOf = (node: GraphNode) =>
    node.kind === "category" ? (isPreview ? 5.5 : 7) : node.kind === "post" ? (isPreview ? 3.4 : 4.2) : isPreview ? 2 : 2.6;

  const SERIF = '"Newsreader Variable", "Noto Serif KR Variable", serif';
  const SANS = '"Pretendard Variable", Pretendard, sans-serif';

  const drawNode = React.useCallback(
    (node: FGNode, ctx: CanvasRenderingContext2D, scale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = radiusOf(node);
      const color = colorOf(node);
      const isFocus = node.id === focusId;
      const isHi = highlight?.has(String(node.id)) ?? false;
      const dimmed = highlight !== null && !isHi;
      const alpha = dimmed ? 0.22 : 1;

      ctx.save();
      ctx.globalAlpha = alpha;

      // 선택/호버: 잉크로 그은 얇은 원
      if (isFocus) {
        ctx.beginPath();
        ctx.arc(x, y, r + 5 / scale, 0, 2 * Math.PI);
        ctx.strokeStyle = palette.ink;
        ctx.lineWidth = 0.8 / scale;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      if (node.kind === "tag") {
        // 태그: 속이 빈 작은 원
        ctx.fillStyle = palette.paper;
        ctx.fill();
        ctx.lineWidth = 1 / Math.max(scale, 1);
        ctx.strokeStyle = palette.muted;
        ctx.stroke();
      } else if (node.kind === "category") {
        // 카테고리: 잉크 점 + 색 테두리 한 겹
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, r + 2.5, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha * 0.35;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.globalAlpha = alpha;
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }

      // 라벨 정책
      // - preview: 카테고리·포스트는 항상, 태그는 하이라이트(호버)될 때만
      // - full: 카테고리는 항상, 태그·포스트는 적당히 확대했거나 하이라이트될 때
      const showLabel = isPreview ? node.kind === "category" || (isHi && highlight !== null) : node.kind === "category" || isHi || scale > 0.85;
      if (showLabel) {
        const isCat = node.kind === "category";
        const px = isCat ? (isPreview ? 15 : 17) : node.kind === "post" ? (isPreview ? 12.5 : 13) : 11.5;
        const font = node.kind === "tag" ? `400 ${px}px ${SANS}` : `${isCat ? 500 : 400} ${px}px ${SERIF}`;
        const label = node.kind === "tag" ? `#${node.label}` : isCat ? categoryName(node) : node.label;
        // 라벨은 화면 좌표계(1/scale)로 그려야 작은 폰트가 확대될 때 자간이 깨지지 않습니다.
        ctx.save();
        ctx.translate(x, y + r + (isCat ? 7 : 4) / scale);
        ctx.scale(1 / scale, 1 / scale);
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;
        ctx.strokeStyle = palette.paper;
        ctx.strokeText(label, 0, 0);
        ctx.fillStyle = node.kind === "tag" ? palette.muted : palette.ink;
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
          linkWidth={(l) => (isLinkHi(l) ? 1.4 : 0.7)}
          linkLineDash={(l) => (l.kind === "post-post" ? [2, 3] : null)}
          linkDirectionalParticles={(l) => (isLinkHi(l) ? 1 : 0)}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleColor={() => palette.linkHi}
          d3VelocityDecay={0.34}
          d3AlphaDecay={isPreview ? 0.04 : 0.045}
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
