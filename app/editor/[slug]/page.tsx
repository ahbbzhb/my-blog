"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EditorForm from "../../components/EditorForm";

import styles from "./page.module.css";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 加载文章
  useEffect(() => {
    async function loadPost() {
      try {
        const response = await fetch(`/api/posts/${slug}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.message);
          return;
        }

        setTitle(data.post.title);
        setSummary(data.post.summary || "");
        setContent(data.post.content);
      } catch (error) {
        console.error(error);
        setError("加载失败");
      } finally {
        setFetching(false);
      }
    }

    if (slug) loadPost();
  }, [slug]);

  // 更新文章
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
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
      setError("更新失败");
    } finally {
      setSaving(false);
    }
  }

  // 删除文章
  async function handleDelete() {

    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      router.push("/");
    } catch (error) {
      console.error(error);
      setError("删除失败");
    } finally {
      setSaving(false);
    }
  }

  // 加载中
  if (fetching) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>加载中...</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>编辑文章</h1>

      <EditorForm
        title={title}
        summary={summary}
        content={content}
        loading={saving}
        error={error}
        submitText="更新文章"
        onTitleChange={setTitle}
        onSummaryChange={setSummary}
        onContentChange={setContent}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
      />
    </main>
  );
}
