"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import * as React from "react";

import { GithubIcon } from "@/components/layout/icons";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 8));

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "border-border/80 bg-background/75 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="flex items-center gap-0.5 rounded-2xl border border-border/70 bg-surface/60 p-1 backdrop-blur-md">
          {siteConfig.nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative whitespace-nowrap rounded-xl px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-4",
                  active ? "text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-0 rounded-xl border border-border bg-surface-muted"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden size-9 items-center justify-center rounded-xl border border-border bg-surface/70 text-muted transition-colors hover:border-primary/40 hover:text-foreground sm:inline-flex"
          >
            <GithubIcon className="size-[17px]" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
