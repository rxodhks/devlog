import * as React from "react";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

import { Callout } from "@/components/mdx/callout";
import { CodeBlock } from "@/components/mdx/code-block";
import { MathCalc } from "@/components/mdx/math-calc";
import { Mermaid } from "@/components/mdx/mermaid";
import { SqlResult } from "@/components/mdx/sql-result";
import { cn } from "@/lib/utils";

type AnyProps = Record<string, unknown> & { children?: React.ReactNode };

/** 앵커 링크(#)가 붙는 헤딩 */
function heading(Tag: "h2" | "h3" | "h4") {
  function Heading({ id, children, className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
      <Tag id={id} className={cn("group relative", className)} {...rest}>
        {id && (
          <a
            href={`#${id}`}
            aria-label="이 섹션 링크"
            className="absolute -left-7 top-0 hidden font-serif text-[0.8em] font-light !text-muted !no-underline opacity-0 transition-opacity duration-500 hover:!text-accent group-hover:opacity-100 md:block"
          >
            §
          </a>
        )}
        {children}
      </Tag>
    );
  }
  Heading.displayName = `Heading(${Tag})`;
  return Heading;
}

/**
 * rehype-pretty-code 가 만든 <figure data-rehype-pretty-code-figure> 를 가로채서
 * 언어 배지 / 파일명 / 복사 버튼이 있는 CodeBlock 으로 감쌉니다.
 */
function Figure(props: AnyProps) {
  if (!("data-rehype-pretty-code-figure" in props)) {
    return <figure {...(props as React.HTMLAttributes<HTMLElement>)} />;
  }

  let title: string | undefined;
  let language: string | undefined;
  const rest: React.ReactNode[] = [];

  React.Children.forEach(props.children, (child) => {
    if (!React.isValidElement<AnyProps>(child)) return;
    const childProps = child.props;
    if ("data-rehype-pretty-code-title" in childProps) {
      title = extractText(childProps.children);
      return;
    }
    if (child.type === "pre") {
      language = childProps["data-language"] as string | undefined;
    }
    rest.push(child);
  });

  return (
    <figure data-rehype-pretty-code-figure="" className="not-prose">
      <CodeBlock language={language} title={title}>
        {rest}
      </CodeBlock>
    </figure>
  );
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement<AnyProps>(node)) return extractText(node.props.children);
  return "";
}

function Anchor({ href = "", children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" {...rest}>
      {children}
    </a>
  );
}

function Table(props: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="not-prose my-10 overflow-x-auto border-y border-rule-strong">
      <table
        className="w-full border-collapse text-left text-[0.92rem] text-ink-soft [&_code]:rounded [&_code]:bg-paper-deep [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_td]:border-t [&_td]:border-rule [&_td]:px-4 [&_td]:py-3 [&_td:first-child]:pl-0 [&_th]:px-4 [&_th]:pb-2.5 [&_th]:pt-3 [&_th]:font-serif [&_th]:font-normal [&_th]:italic [&_th]:text-muted [&_th:first-child]:pl-0"
        {...props}
      />
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-b-2 border-rule-strong bg-paper-raised px-1.5 py-0.5 font-mono text-[0.8em]">
      {children}
    </kbd>
  );
}

export const mdxComponents: MDXComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  h4: heading("h4"),
  a: Anchor,
  figure: Figure as MDXComponents["figure"],
  table: Table,
  // custom
  Callout,
  SqlResult,
  MathCalc,
  Mermaid,
  Kbd,
};
