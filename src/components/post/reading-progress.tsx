"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** 페이지 상단 고정 읽기 진행 바 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-brand-gradient shadow-[0_0_12px_rgb(var(--primary)/0.7)]"
    />
  );
}
