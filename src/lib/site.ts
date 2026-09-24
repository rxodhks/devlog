import type { CategoryId, Difficulty } from "@/types/post";

export const siteConfig = {
  name: "TechLog",
  tagline: "천천히 이해한 것들",
  description: "컴퓨터 과학, 데이터베이스, 파이썬, 네트워크를 천천히 이해하고 조용히 적어 두는 곳.",
  url: "http://localhost:3000",
  author: {
    name: "김태완",
    role: "풀스택을 공부하는 학생",
    bio: "Java와 React, SQL을 중심으로 공부하고 있어요. 이해한 것을 코드와 그림으로 한 번 더 설명해 보면서, 머릿속에 남은 것만 이곳에 옮겨 적습니다.",
    github: "https://github.com/",
    email: "mailto:hello@example.com",
  },
  /** 홈 여백에 적히는 "요즘 붙잡고 있는 것" 메모 — 자유롭게 바꾸세요 */
  now: {
    studying: "인덱스와 실행 계획",
  },
  nav: [
    { href: "/", label: "홈" },
    { href: "/posts", label: "글" },
    { href: "/graph", label: "연결" },
  ],
} as const;

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  /** 한글 이름 */
  name: string;
  short: string;
  description: string;
  /** 캔버스(지식 그래프)처럼 CSS 변수를 못 쓰는 곳에서 사용할 HEX — globals.css 의 --cat-* 와 동일 */
  hex: { light: string; dark: string };
}

/** 표시 순서 = dataviz 검증을 통과한 인접 순서 (database → python → cs → network) */
export const categories: Record<CategoryId, CategoryInfo> = {
  database: {
    id: "database",
    label: "Database",
    name: "데이터베이스",
    short: "DB",
    description: "SQL, 정규화, 트랜잭션처럼 데이터를 다루는 엔진의 원리",
    hex: { light: "#3A6FA8", dark: "#5F8FCC" },
  },
  python: {
    id: "python",
    label: "Python",
    name: "파이썬",
    short: "PY",
    description: "런타임, 제너레이터, 비동기 — 파이썬이 실제로 움직이는 방식",
    hex: { light: "#B7731C", dark: "#C48530" },
  },
  cs: {
    id: "cs",
    label: "Computer Science",
    name: "컴퓨터 과학",
    short: "CS",
    description: "알고리즘과 자료구조, 복잡도 같은 기초 체력",
    hex: { light: "#8A5AAE", dark: "#9D78C6" },
  },
  network: {
    id: "network",
    label: "Network",
    name: "네트워크",
    short: "NET",
    description: "TCP/IP와 HTTP, 패킷이 길을 찾아가는 방법",
    hex: { light: "#2E8660", dark: "#46A073" },
  },
};

export const categoryList = Object.values(categories);

/**
 * Tailwind는 동적 클래스(`bg-${x}`)를 추출하지 못하므로 정적으로 선언합니다.
 * 카테고리 색은 "표식"(점, 선)에만 쓰고, 글자는 항상 잉크 색으로 둡니다.
 */
export const categoryClasses: Record<CategoryId, { dot: string; text: string; border: string; bg: string }> = {
  database: { dot: "bg-cat-database", text: "text-cat-database", border: "border-cat-database", bg: "bg-cat-database/10" },
  python: { dot: "bg-cat-python", text: "text-cat-python", border: "border-cat-python", bg: "bg-cat-python/10" },
  cs: { dot: "bg-cat-cs", text: "text-cat-cs", border: "border-cat-cs", bg: "bg-cat-cs/10" },
  network: { dot: "bg-cat-network", text: "text-cat-network", border: "border-cat-network", bg: "bg-cat-network/10" },
};

export const difficultyMeta: Record<Difficulty, { label: string; level: 1 | 2 | 3 }> = {
  beginner: { label: "입문", level: 1 },
  intermediate: { label: "중급", level: 2 },
  advanced: { label: "심화", level: 3 },
};
