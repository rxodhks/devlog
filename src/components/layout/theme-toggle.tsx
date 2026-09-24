"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

/**
 * 테마 스위처
 * - View Transitions API 지원 브라우저: 클릭 지점에서 원형(clip-path)으로 퍼지는 전환
 * - 미지원 브라우저: 아이콘 회전 애니메이션만 적용
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggle = React.useCallback(async () => {
    const next = isDark ? "light" : "dark";
    const apply = () => {
      // View Transition 스냅샷이 새 테마로 찍히도록 클래스를 즉시 반영 (next-themes 와 동일한 방식)
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      setTheme(next);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduceMotion || !buttonRef.current) {
      apply();
      return;
    }

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => {
      flushSync(apply);
    });

    await transition.ready;
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  }, [isDark, setTheme]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className={cn(
        "relative -mr-2 inline-flex size-10 items-center justify-center overflow-hidden rounded-full text-muted transition-colors duration-300 hover:bg-paper-deep hover:text-ink",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted ? (
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, opacity: 0, y: 6 }}
            animate={{ rotate: 0, opacity: 1, y: 0 }}
            exit={{ rotate: 90, opacity: 0, y: -6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute"
          >
            {isDark ? <Moon className="size-[17px]" strokeWidth={1.5} /> : <Sun className="size-[17px]" strokeWidth={1.5} />}
          </motion.span>
        ) : (
          <span className="size-[18px]" />
        )}
      </AnimatePresence>
    </button>
  );
}
