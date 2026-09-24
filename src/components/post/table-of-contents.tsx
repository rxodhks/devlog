"use client";

import * as React from "react";
import { LayoutGroup, motion } from "framer-motion";
import { AlignLeft } from "lucide-react";

import { useActiveHeading } from "@/components/post/use-active-heading";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/types/post";

interface Props {
  items: TocItem[];
  className?: string;
  /** 같은 페이지에 TOC가 두 개(모바일/사이드바)일 때 layoutId 충돌 방지 */
  group?: string;
}

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
      <p className="eyebrow mb-3 flex items-center gap-2">
        <AlignLeft className="size-3.5" /> On this page
      </p>
      <ul className="relative space-y-0.5 border-l border-border">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="relative">
              {isActive && (
                <motion.span
                  layoutId="active-toc"
                  className="absolute -left-px top-0 h-full w-[2px] rounded-full bg-brand-gradient shadow-[0_0_10px_rgb(var(--primary)/0.8)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <a
                href={`#${item.id}`}
                onClick={(e) => onClick(e, item.id)}
                className={cn(
                  "block py-1.5 pr-2 text-[13px] leading-snug transition-colors",
                  item.depth === 3 ? "pl-7" : "pl-4",
                  isActive ? "font-medium text-foreground" : "text-muted hover:text-foreground",
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
