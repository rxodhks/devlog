"use client";

import { motion } from "framer-motion";

/**
 * 형광펜으로 한 번 쓱 칠한 듯한 강조.
 * 붓 자국 모양의 SVG 가 왼쪽에서 오른쪽으로 번집니다.
 */
export function Marker({ children, delay = 0.6 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <motion.svg
        aria-hidden
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        className="absolute -inset-x-[0.12em] bottom-[0.02em] -z-0 h-[0.62em] w-[calc(100%+0.24em)] text-marker"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 1.1, delay, ease: [0.65, 0, 0.35, 1] }}
      >
        <path
          d="M3 22c14-9 40-12 64-11 30 1 52 5 80 3 20-1 36-6 50-4 2 3 1 9-2 13-18 4-38 3-58 5-30 2-58 6-88 6-18 0-34-1-44-4-3-3-4-6-2-8z"
          fill="currentColor"
        />
      </motion.svg>
      <span className="relative">{children}</span>
    </span>
  );
}
