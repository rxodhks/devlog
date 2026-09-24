"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Wordmark } from "@/components/layout/wordmark";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/** 손으로 그은 듯한 밑줄 (활성 메뉴) */
function Scribble() {
  return (
    <motion.svg
      layoutId="nav-scribble"
      viewBox="0 0 60 8"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-0.5 left-0 h-[7px] w-full text-accent"
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      aria-hidden
    >
      <motion.path
        d="M1 5.2C9 3.4 17 6.6 25 4.6S41 2.8 49 4.9 57 5.2 59 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,box-shadow,backdrop-filter] duration-500",
        scrolled ? "bg-paper/80 shadow-[0_1px_0_rgb(var(--rule))] backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="container flex h-[72px] items-center justify-between gap-6">
        <Wordmark />

        <div className="flex items-center gap-5 sm:gap-8">
          <nav aria-label="주 메뉴" className="flex items-center gap-5 sm:gap-7">
            {siteConfig.nav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-2.5 text-[0.95rem] transition-colors duration-300",
                    active ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                  {active && <Scribble />}
                </Link>
              );
            })}
          </nav>
          <span className="h-4 w-px bg-rule-strong" aria-hidden />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
