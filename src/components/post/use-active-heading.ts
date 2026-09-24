"use client";

import * as React from "react";

/**
 * Scroll-spy: "읽기 기준선"(헤더 아래 + 뷰포트 30%)을 이미 지나간 헤딩 중 마지막 것을 활성으로 판단합니다.
 * - rAF 로 스로틀링해 스크롤 프레임당 한 번만 계산
 * - 페이지 맨 아래에 도달하면 마지막 헤딩을 활성화 (짧은 마지막 섹션 대응)
 */
export function useActiveHeading(ids: string[]) {
  const [active, setActive] = React.useState<string | null>(ids[0] ?? null);

  React.useEffect(() => {
    if (ids.length === 0) return;

    let frame = 0;
    const compute = () => {
      frame = 0;
      const line = 96 + window.innerHeight * 0.3;
      let current: string | null = ids[0];

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = id;
        else break;
      }

      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) current = ids[ids.length - 1];

      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}
