"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** 페이지 맨 위, 잉크 한 줄로 번지는 읽기 진행선 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 90, damping: 30, restDelta: 0.001 });

  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-accent/70" />;
}
