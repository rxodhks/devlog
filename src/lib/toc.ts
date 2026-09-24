import GithubSlugger from "github-slugger";
import type { TocItem } from "@/types/post";

/** 헤딩 텍스트에서 인라인 마크다운을 제거해 rehype-slug 와 같은 id를 만든다. */
function toPlainText(md: string) {
  return md
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

/** MDX 원문에서 h2/h3 목차를 추출 (코드 펜스 내부는 무시) */
export function extractToc(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of source.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const text = toPlainText(match[2]);
    items.push({
      id: slugger.slug(text),
      text,
      depth: match[1].length as 2 | 3,
    });
  }
  return items;
}
