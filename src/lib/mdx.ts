import "server-only";

import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";

import { remarkMermaid } from "@/lib/remark-mermaid";
import { mdxComponents } from "@/components/mdx/mdx-components";

const prettyCodeOptions: PrettyCodeOptions = {
  // light/dark 두 테마를 CSS 변수로 동시에 출력 → globals.css에서 .dark 기준 전환
  theme: { light: "kanagawa-lotus", dark: "kanagawa-dragon" },
  keepBackground: false,
  defaultLang: { block: "plaintext" },
  transformers: [
    transformerNotationDiff(), // // [!code ++] , // [!code --]
    transformerNotationHighlight(), // // [!code highlight]
    transformerNotationFocus(), // // [!code focus]
  ],
};

export async function renderMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      // 로컬 저장소의 신뢰된 MDX만 렌더링하므로 JSX prop 표현식(columns={[...]}) 허용.
      // 위험 전역(eval, Function, process...)은 blockDangerousJS 기본값으로 차단됩니다.
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath, remarkMermaid],
        // rehype-katex 를 pretty-code 보다 먼저 실행해야 수식(code.language-math)이 하이라이터에 먹히지 않습니다.
        rehypePlugins: [rehypeSlug, [rehypeKatex, { strict: false }], [rehypePrettyCode, prettyCodeOptions]],
      },
    },
  });
  return content;
}
