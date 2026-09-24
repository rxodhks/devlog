// @ts-check
const defaultTheme = require("tailwindcss/defaultTheme");

/**
 * CSS 변수(RGB 채널)를 Tailwind 컬러로 매핑합니다.
 * `bg-surface/60` 처럼 알파값을 함께 쓸 수 있습니다.
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
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        background: token("background"),
        foreground: token("foreground"),
        surface: {
          DEFAULT: token("surface"),
          muted: token("surface-muted"),
          elevated: token("surface-elevated"),
        },
        border: token("border"),
        muted: token("muted"),
        primary: {
          DEFAULT: token("primary"), // #3B82F6 Electric Indigo/Blue
          foreground: "rgb(255 255 255 / <alpha-value>)",
        },
        cyan: { DEFAULT: token("cyan") }, // #06B6D4
        success: { DEFAULT: token("success") }, // #10B981 Emerald Mint
        danger: { DEFAULT: token("danger") },
        warning: { DEFAULT: token("warning") },
        // 카테고리 고유 색상 (지식 그래프, 칩, 카드 액센트에 공통 사용)
        cat: {
          cs: token("cat-cs"),
          database: token("cat-database"),
          python: token("cat-python"),
          network: token("cat-network"),
        },
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          "Pretendard",
          '"Inter Variable"',
          ...defaultTheme.fontFamily.sans,
        ],
        mono: [
          '"JetBrains Mono Variable"',
          '"Fira Code"',
          ...defaultTheme.fontFamily.mono,
        ],
      },
      maxWidth: {
        prose: "780px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--cyan)) 100%)",
        "grid-pattern":
          "linear-gradient(to right, rgb(var(--border) / 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--border) / 0.5) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--primary) / 0.15), 0 8px 40px -12px rgb(var(--primary) / 0.45)",
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.08)",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 6s ease infinite",
        shimmer: "shimmer 2.4s linear infinite",
        blink: "blink 1.1s step-end infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
      },
      typography: () => ({
        techlog: {
          css: {
            "--tw-prose-body": "rgb(var(--foreground) / 0.86)",
            "--tw-prose-headings": "rgb(var(--foreground))",
            "--tw-prose-lead": "rgb(var(--muted))",
            "--tw-prose-links": "rgb(var(--primary))",
            "--tw-prose-bold": "rgb(var(--foreground))",
            "--tw-prose-counters": "rgb(var(--muted))",
            "--tw-prose-bullets": "rgb(var(--primary) / 0.7)",
            "--tw-prose-hr": "rgb(var(--border))",
            "--tw-prose-quotes": "rgb(var(--foreground))",
            "--tw-prose-quote-borders": "rgb(var(--primary))",
            "--tw-prose-captions": "rgb(var(--muted))",
            "--tw-prose-code": "rgb(var(--foreground))",
            "--tw-prose-th-borders": "rgb(var(--border))",
            "--tw-prose-td-borders": "rgb(var(--border) / 0.6)",
            lineHeight: "1.7",
            fontSize: "1.0625rem",
            maxWidth: "none",
            "h2, h3, h4": {
              scrollMarginTop: "6rem",
              letterSpacing: "-0.02em",
              fontWeight: "700",
            },
            h2: { marginTop: "2.6em", fontSize: "1.6em" },
            h3: { marginTop: "2em", fontSize: "1.25em" },
            a: {
              textDecoration: "none",
              borderBottom: "1px solid rgb(var(--primary) / 0.35)",
              transition: "border-color .2s",
              "&:hover": { borderBottomColor: "rgb(var(--primary))" },
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            ":not(pre) > code": {
              fontWeight: "500",
              fontSize: "0.86em",
              padding: "0.18em 0.42em",
              borderRadius: "0.375rem",
              backgroundColor: "rgb(var(--surface-muted))",
              border: "1px solid rgb(var(--border))",
            },
            blockquote: {
              fontStyle: "normal",
              fontWeight: "400",
              backgroundColor: "rgb(var(--surface-muted) / 0.6)",
              borderRadius: "0 0.75rem 0.75rem 0",
              padding: "0.25em 1.25em",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:last-of-type::after": { content: "none" },
            table: { fontSize: "0.92em" },
            "thead th": { paddingTop: "0.6em", paddingBottom: "0.6em" },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
