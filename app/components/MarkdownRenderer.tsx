"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type MarkdownRendererProps = {
  content: string;
};

/**
 * 将 LaTeX 数学分隔符转换为 remark-math 支持的格式：
 *   \(...\) → $...$
 *   \[...\] → $$...$$
 *
 * 跳过代码块（```...```）内的内容，避免误转换。
 */
function normalizeMathDelimiters(content: string): string {
  // 在代码块外的区域进行替换
  const parts: string[] = [];
  let remaining = content;
  let depth = 0;

  while (remaining.length > 0) {
    const tick = remaining.indexOf(depth === 0 ? "```" : "\n```");
    const mathInline = remaining.indexOf("\\(");
    const mathBlock = remaining.indexOf("\\[");

    if (depth === 0) {
      // 非代码块区域：正常处理
      const nextTick = tick !== -1 ? tick : Infinity;
      const nextMath =
        mathInline !== -1 && mathBlock !== -1
          ? Math.min(mathInline, mathBlock)
          : mathInline !== -1
            ? mathInline
            : mathBlock !== -1
              ? mathBlock
              : -1;

      if (nextMath !== -1 && nextMath < nextTick) {
        // 先遇到数学分隔符
        parts.push(remaining.slice(0, nextMath));
        if (remaining.startsWith("\\[", nextMath)) {
          parts.push("$$");
          remaining = remaining.slice(nextMath + 2);
        } else if (remaining.startsWith("\\(", nextMath)) {
          parts.push("$");
          remaining = remaining.slice(nextMath + 2);
        }
        continue;
      } else if (nextTick !== Infinity) {
        // 先遇到代码块
        parts.push(remaining.slice(0, tick + 3));
        remaining = remaining.slice(tick + 3);
        depth = 1;
        continue;
      } else {
        // 没有更多分隔符
        parts.push(remaining);
        break;
      }
    } else {
      // 代码块内：跳过，找闭合 ```
      if (tick !== -1) {
        const closePos = tick + 4; // "\n```" → 4 chars
        parts.push(remaining.slice(0, closePos));
        remaining = remaining.slice(closePos);
        depth = 0;
        continue;
      } else {
        parts.push(remaining);
        break;
      }
    }
  }

  // 第二遍：将 \] 和 \) 转换回 $$ 和 $
  const joined = parts.join("");
  return joined.replace(/\\\]/g, "$$").replace(/\\\)/g, "$");
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const processed = normalizeMathDelimiters(content);
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
      {processed}
    </ReactMarkdown>
  );
}
