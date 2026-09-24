import type { Root, Code } from "mdast";
import { visit } from "unist-util-visit";

/**
 * ```mermaid 코드 펜스를 <Mermaid chart="..." /> MDX JSX 노드로 바꿉니다.
 * shiki 하이라이터가 mermaid 소스를 먹어버리기 전에 remark 단계에서 가로챕니다.
 */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang !== "mermaid" || !parent || index === undefined) return;

      const caption = /title="([^"]+)"/.exec(node.meta ?? "")?.[1];
      const attributes = [{ type: "mdxJsxAttribute", name: "chart", value: node.value }];
      if (caption) attributes.push({ type: "mdxJsxAttribute", name: "caption", value: caption });

      // mdast-util-mdx-jsx 의 MdxJsxFlowElement 형태
      parent.children.splice(index, 1, {
        type: "mdxJsxFlowElement",
        name: "Mermaid",
        attributes,
        children: [],
      } as unknown as Code);
    });
  };
}
