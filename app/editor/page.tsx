"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import EditorForm from "../components/EditorForm";
import { useDraftProtection } from "../hooks/useDraftProtection";

import styles from "./page.module.css";

const DRAFT_SLUG = "new";

export default function EditorPage() {
  const router = useRouter();

  // 初始化为空字符串 — 不碰 localStorage，避免 hydration mismatch
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 自动保存 + 恢复草稿（仅在客户端 useEffect 中读取 localStorage）
  const { isRestored, restoredData, persist, clear } =
    useDraftProtection(DRAFT_SLUG);

  // 客户端挂载后恢复草稿
  const draftApplied = useRef(false);
  useEffect(() => {
    if (restoredData && !draftApplied.current) {
      setTitle(restoredData.title);
      setSummary(restoredData.summary);
      setContent(restoredData.content);
      draftApplied.current = true;
    }
  }, [restoredData]);

  // 内容变化 → 自动存 localStorage（防抖）
  useEffect(() => {
    persist({ title, summary, content });
  }, [title, summary, content, persist]);

  /** 保存草稿 → POST published=false → 跳转编辑页继续写 */
  async function handleSave() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, content, published: false }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      clear(); // ✅ 已保存到服务器，清除本地草稿
      router.push(`/editor/${data.slug}`);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  /** 发布文章 → POST published=true → 跳转文章页 */
  async function handlePublish() {
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("标题不能为空");
      return;
    }

    if (!content.trim()) {
      setError("正文不能为空");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, content, published: true }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      clear(); // ✅ 已发布，清除本地草稿
      router.push(`/blog/${data.slug}`);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>写博客</h1>

      {/* ✅ 草稿恢复提示 */}
      {isRestored && (
        <p className={styles.draftHint}>📝 已恢复未保存的内容</p>
      )}

      <EditorForm
        title={title}
        summary={summary}
        content={content}
        loading={loading}
        error={error}
        success={success}
        onTitleChange={setTitle}
        onSummaryChange={setSummary}
        onContentChange={setContent}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </main>
  );
}
