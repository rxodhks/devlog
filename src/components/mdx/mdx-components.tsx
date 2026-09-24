import * as React from "react";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { Hash } from "lucide-react";

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
            className="absolute -left-6 top-1/2 hidden -translate-y-1/2 !border-0 text-muted/50 opacity-0 transition-opacity hover:text-primary group-hover:opacity-100 md:block"
          >
            <Hash className="size-4" />
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
    <div className="not-prose my-7 overflow-x-auto rounded-2xl border border-border">
      <table
        className="w-full border-collapse text-left text-[0.9rem] [&_td]:border-t [&_td]:border-border/70 [&_td]:px-4 [&_td]:py-2.5 [&_th]:bg-surface-muted/70 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-semibold [&_tr:hover_td]:bg-surface-muted/40"
        {...props}
      />
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-b-2 border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[0.8em]">
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
