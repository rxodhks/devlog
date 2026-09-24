import type { CategoryId, Difficulty } from "@/types/post";

export const siteConfig = {
  name: "TechLog",
  tagline: "Engineering notes on CS · Database · Python · Network",
  description:
    "컴퓨터 과학, 데이터베이스/SQL, Python, 네트워크를 깊게 파고들고 기록하는 엔지니어링 테크 블로그.",
  url: "http://localhost:3000",
  author: {
    name: "김태완",
    handle: "@taewan",
    role: "Full-stack Developer in progress",
    bio: "Java · React · SQL을 중심으로 풀스택을 공부하며, 이해한 것을 코드와 다이어그램으로 다시 설명해 보는 과정을 기록합니다.",
    github: "https://github.com/",
    email: "mailto:hello@example.com",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/posts", label: "Posts" },
    { href: "/graph", label: "Graph" },
  ],
} as const;

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  short: string;
  description: string;
  /** tailwind 클래스에서 사용할 토큰 이름 (bg-cat-*, text-cat-*) */
  token: `cat-${CategoryId}`;
  /** 캔버스(지식 그래프)처럼 CSS 변수를 못 쓰는 곳에서 사용할 HEX */
  hex: { light: string; dark: string };
}

export const categories: Record<CategoryId, CategoryInfo> = {
  cs: {
    id: "cs",
    label: "Computer Science",
    short: "CS",
    description: "알고리즘, 자료구조, 운영체제 등 컴퓨터 과학의 기초 체력",
    token: "cat-cs",
    hex: { light: "#8B5CF6", dark: "#A78BFA" },
  },
  database: {
    id: "database",
    label: "Database / SQL",
    short: "DB",
    description: "SQL, 정규화, 트랜잭션, 인덱스 — 데이터를 다루는 엔진의 원리",
    token: "cat-database",
    hex: { light: "#3B82F6", dark: "#60A5FA" },
  },
  python: {
    id: "python",
    label: "Python",
    short: "PY",
    description: "파이썬 런타임, 제너레이터, 비동기, 성능 최적화",
    token: "cat-python",
    hex: { light: "#D97706", dark: "#FBBF24" },
  },
  network: {
    id: "network",
    label: "Computer Networking",
    short: "NET",
    description: "TCP/IP, HTTP, 혼잡 제어 등 패킷이 이동하는 방식",
    token: "cat-network",
    hex: { light: "#0891B2", dark: "#22D3EE" },
  },
};

export const categoryList = Object.values(categories);

export const difficultyMeta: Record<Difficulty, { label: string; level: 1 | 2 | 3; className: string }> = {
  beginner: {
    label: "Beginner",
    level: 1,
    className: "text-success border-success/30 bg-success/10",
  },
  intermediate: {
    label: "Intermediate",
    level: 2,
    className: "text-primary border-primary/30 bg-primary/10",
  },
  advanced: {
    label: "Advanced",
    level: 3,
    className: "text-danger border-danger/30 bg-danger/10",
  },
};

/**
 * Tailwind는 동적 클래스(`bg-${x}`)를 추출하지 못하므로 카테고리별 클래스를 정적으로 선언합니다.
 */
export const categoryClasses: Record<
  CategoryId,
  { text: string; bg: string; softBg: string; border: string; dot: string; ring: string }
> = {
  cs: {
    text: "text-cat-cs",
    bg: "bg-cat-cs",
    softBg: "bg-cat-cs/10",
    border: "border-cat-cs/30",
    dot: "bg-cat-cs shadow-[0_0_12px_rgb(var(--cat-cs)/0.8)]",
    ring: "ring-cat-cs/40",
  },
  database: {
    text: "text-cat-database",
    bg: "bg-cat-database",
    softBg: "bg-cat-database/10",
    border: "border-cat-database/30",
    dot: "bg-cat-database shadow-[0_0_12px_rgb(var(--cat-database)/0.8)]",
    ring: "ring-cat-database/40",
  },
  python: {
    text: "text-cat-python",
    bg: "bg-cat-python",
    softBg: "bg-cat-python/10",
    border: "border-cat-python/30",
    dot: "bg-cat-python shadow-[0_0_12px_rgb(var(--cat-python)/0.8)]",
    ring: "ring-cat-python/40",
  },
  network: {
    text: "text-cat-network",
    bg: "bg-cat-network",
    softBg: "bg-cat-network/10",
    border: "border-cat-network/30",
    dot: "bg-cat-network shadow-[0_0_12px_rgb(var(--cat-network)/0.8)]",
    ring: "ring-cat-network/40",
  },
};
