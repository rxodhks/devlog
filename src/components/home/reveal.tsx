"use client";

import * as React from "react";
import { motion } from "framer-motion";

type Tag = "div" | "li" | "section";

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: Tag;
  delay?: number;
  y?: number;
}

/** 화면에 들어올 때 아주 천천히 떠오르는 래퍼 */
export function Reveal({ as = "div", delay = 0, y = 14, children, ...props }: RevealProps) {
  const Comp = motion[as] as React.ElementType;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Comp>
  );
}
