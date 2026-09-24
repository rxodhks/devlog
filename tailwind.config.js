// @ts-check
const defaultTheme = require("tailwindcss/defaultTheme");

/**
 * "종이와 잉크" 디자인 토큰
 * CSS 변수(RGB 채널)를 Tailwind 컬러로 매핑합니다. → `bg-paper/60` 처럼 알파값 사용 가능
 * 실제 값은 src/app/globals.css 의 :root(종이) / .dark(먹색 밤) 에 있습니다.
 * @param {string} name
 */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}", "./content/**/*.mdx"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "2rem", lg: "3rem" },
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        // 표면
        background: token("paper"),
        paper: { DEFAULT: token("paper"), deep: token("paper-deep"), raised: token("paper-raised") },
        // 잉크 (텍스트)
        foreground: token("ink"),
        ink: { DEFAULT: token("ink"), soft: token("ink-soft") },
        muted: token("muted"),
        faint: token("faint"),
        // 선
        border: token("rule"),
        rule: { DEFAULT: token("rule"), strong: token("rule-strong") },
        // 강조: 세이지 한 가지만
        accent: { DEFAULT: token("accent"), soft: token("accent-soft") },
        marker: token("marker"),
        danger: token("danger"),
        success: token("success"),
        // 카테고리 잉크 — 점·선 같은 작은 표식에만 사용 (dataviz 검증 통과 팔레트)
        cat: {
          database: token("cat-database"),
          python: token("cat-python"),
          cs: token("cat-cs"),
          network: token("cat-network"),
        },
        // 학습 기록 히트맵용 단일 색상 램프 (sequential)
        seq: {
          0: token("seq-0"),
          1: token("seq-1"),
          2: token("seq-2"),
          3: token("seq-3"),
          4: token("seq-4"),
        },
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', "Pretendard", '"Inter Variable"', ...defaultTheme.fontFamily.sans],
        serif: ['"Newsreader Variable"', '"Noto Serif KR Variable"', ...defaultTheme.fontFamily.serif],
        mono: ['"JetBrains Mono Variable"', '"Fira Code"', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        "display-1": ["clamp(2.4rem, 1.4rem + 3.6vw, 4.25rem)", { lineHeight: "1.18", letterSpacing: "-0.025em" }],
        "display-2": ["clamp(1.9rem, 1.3rem + 2vw, 2.9rem)", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
      },
      maxWidth: {
        prose: "700px",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.35)" },
        },
      },
      animation: {
        breathe: "breathe 3.2s ease-in-out infinite",
      },
      typography: () => ({
        paper: {
          css: {
            "--tw-prose-body": "rgb(var(--ink-soft))",
            "--tw-prose-headings": "rgb(var(--ink))",
            "--tw-prose-lead": "rgb(var(--muted))",
            "--tw-prose-links": "rgb(var(--accent))",
            "--tw-prose-bold": "rgb(var(--ink))",
            "--tw-prose-counters": "rgb(var(--muted))",
            "--tw-prose-bullets": "rgb(var(--faint))",
            "--tw-prose-hr": "rgb(var(--rule))",
            "--tw-prose-quotes": "rgb(var(--ink))",
            "--tw-prose-quote-borders": "rgb(var(--rule-strong))",
            "--tw-prose-captions": "rgb(var(--muted))",
            "--tw-prose-code": "rgb(var(--ink))",
            "--tw-prose-th-borders": "rgb(var(--rule-strong))",
            "--tw-prose-td-borders": "rgb(var(--rule))",
            fontSize: "1.0625rem",
            lineHeight: "1.85",
            maxWidth: "none",
            p: { marginTop: "1.1em", marginBottom: "1.1em" },
            "h2, h3, h4": {
              fontFamily: "var(--font-serif)",
              scrollMarginTop: "6rem",
              letterSpacing: "-0.015em",
            },
            h2: { fontSize: "1.6em", fontWeight: "500", marginTop: "2.6em", marginBottom: "0.8em", lineHeight: "1.35" },
            h3: { fontSize: "1.25em", fontWeight: "500", marginTop: "2.1em", marginBottom: "0.6em" },
            strong: { fontWeight: "600" },
            a: {
              fontWeight: "inherit",
              textDecorationLine: "underline",
              textDecorationThickness: "1px",
              textUnderlineOffset: "0.25em",
              textDecorationColor: "rgb(var(--accent) / 0.4)",
              transition: "text-decoration-color .3s",
              "&:hover": { textDecorationColor: "rgb(var(--accent))" },
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            ":not(pre) > code": {
              fontWeight: "450",
              fontSize: "0.86em",
              padding: "0.12em 0.38em",
              borderRadius: "0.3rem",
              backgroundColor: "rgb(var(--paper-deep))",
            },
            blockquote: {
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: "400",
              fontSize: "1.12em",
              borderLeftWidth: "1px",
              paddingLeft: "1.2em",
              color: "rgb(var(--ink))",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:last-of-type::after": { content: "none" },
            hr: {
              border: "0",
              textAlign: "center",
              margin: "3em 0",
              "&::before": { content: '"· · ·"', color: "rgb(var(--faint))", letterSpacing: "0.6em" },
            },
            "ul > li::marker": { color: "rgb(var(--faint))" },
            li: { marginTop: "0.35em", marginBottom: "0.35em" },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
