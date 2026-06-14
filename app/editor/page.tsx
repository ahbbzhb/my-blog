"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditorForm from "../components/EditorForm";

import styles from "./page.module.css";

export default function EditorPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setError("");

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
        body: JSON.stringify({ title, summary, content }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      router.push(`/blog/${data.slug}`);
    } catch (error) {
      console.error(error);
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>写博客</h1>

      <EditorForm
        title={title}
        summary={summary}
        content={content}
        loading={loading}
        error={error}
        submitText="发布文章"
        onTitleChange={setTitle}
        onSummaryChange={setSummary}
        onContentChange={setContent}
        onSubmit={handlePublish}
      />
    </main>
  );
}
