"use client";

import { motion } from "framer-motion";

/**
 * 라우트 전환마다 새로 마운트되는 template.
 * 종이가 천천히 내려앉듯 — 짧은 거리, 긴 호흡의 Fade & Slide Up.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
