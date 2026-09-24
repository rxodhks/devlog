"use client";

import { motion } from "framer-motion";

/**
 * App Router의 template은 라우트 전환 시마다 새로 마운트됩니다.
 * → Home ↔ Post 사이 이동에 Fade & Slide Up 전환을 적용합니다.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
