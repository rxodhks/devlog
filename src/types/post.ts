export type CategoryId = "cs" | "database" | "python" | "network";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface PostFrontmatter {
  title: string;
  /** 카드/지식 그래프 노드처럼 좁은 공간에 쓰는 짧은 제목 */
  shortTitle?: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  category: CategoryId;
  tags: string[];
  difficulty: Difficulty;
  featured?: boolean;
  series?: string;
  /** 지식 그래프에서 직접 연결할 다른 포스트 slug */
  related?: string[];
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  readingTime: ReadingTime;
}

export interface Post extends PostMeta {
  source: string; // frontmatter 제외 MDX 원문
}

export interface ReadingTime {
  minutes: number;
  words: number;
  codeLines: number;
}

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}
