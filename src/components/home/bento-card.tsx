"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

interface BentoCardProps extends HTMLMotionProps<"div"> {
  /** 등장 애니메이션 순서 (stagger) */
  index?: number;
  /** 마우스 추적 glow 비활성화 */
  plain?: boolean;
  /** hover scale 비활성화 (캔버스처럼 포인터 좌표가 중요한 카드) */
  static?: boolean;
}

/**
 * Bento 그리드 카드
 * - hover: scale 1.015 + 커서를 따라다니는 radial glow (내부 + 보더)
 * - viewport 진입 시 fade & slide-up
 */
export const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ className, children, index = 0, plain = false, static: isStatic = false, onMouseMove, ...props }, ref) => {
    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

    // 리렌더 없이 CSS 변수만 갱신
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = localRef.current;
      if (el && !plain) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }
      onMouseMove?.(e);
    };

    return (
      <motion.div
        ref={localRef}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        whileHover={isStatic ? undefined : { scale: 1.015 }}
        transition={{
          opacity: { duration: 0.5, delay: index * 0.06 },
          y: { duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] },
          scale: { type: "spring", stiffness: 300, damping: 24 },
        }}
        onMouseMove={handleMouseMove}
        className={cn("surface-card group/card", !plain && "glow-card", className)}
        {...props}
      >
        <div className="relative z-10 h-full">{children as React.ReactNode}</div>
      </motion.div>
    );
  },
);
BentoCard.displayName = "BentoCard";

export function CardHeader({
  icon: Icon,
  eyebrow,
  title,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div>
        <p className="eyebrow flex items-center gap-1.5">
          {Icon && <Icon className="size-3.5 text-primary" />}
          {eyebrow}
        </p>
        {title && <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{title}</h3>}
      </div>
      {action}
    </div>
  );
}
