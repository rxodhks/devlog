"use client";

import * as React from "react";
import { LayoutGroup, motion } from "framer-motion";

import { useActiveHeading } from "@/components/post/use-active-heading";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/types/post";

interface Props {
  items: TocItem[];
  className?: string;
  /** 같은 페이지에 TOC가 두 개(모바일/사이드바)일 때 layoutId 충돌 방지 */
  group?: string;
}

/** 여백의 차례 — 지금 읽는 곳 옆을 가느다란 잉크 선이 따라 내려갑니다 */
export function TableOfContents({ items, className, group = "toc" }: Props) {
  const ids = React.useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveHeading(ids);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  if (items.length === 0) return null;

  return (
    <LayoutGroup id={group}>
      <nav aria-label="목차" className={className}>
        <p className="meta mb-4 text-sm">차례</p>
        <ul className="relative space-y-0.5 border-l border-rule">
          {items.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id} className="relative">
                {isActive && (
                  <motion.span
                    layoutId="active-toc"
                    className="absolute -left-px top-1 bottom-1 w-px bg-ink"
                    transition={{ type: "spring", stiffness: 220, damping: 30 }}
                  />
                )}
                <a
                  href={`#${item.id}`}
                  onClick={(e) => onClick(e, item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "block py-1.5 pr-2 text-[0.85rem] leading-snug transition-colors duration-500",
                    item.depth === 3 ? "pl-7" : "pl-4",
                    isActive ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </LayoutGroup>
  );
}
