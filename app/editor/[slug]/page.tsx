"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import EditorForm from "../../components/EditorForm";
import { useDraftProtection } from "../../hooks/useDraftProtection";

import styles from "./page.module.css";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  // init 时不碰 localStorage，避免 hydration mismatch
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 自动保存 + 恢复草稿（localStorage 仅在客户端 useEffect 中读取）
  const { isRestored, restoredData, persist, clear } =
    useDraftProtection(slug);

  // 客户端挂载后：优先恢复本地草稿，否则从服务端加载
  const draftApplied = useRef(false);
  useEffect(() => {
    if (restoredData && !draftApplied.current) {
      // 有本地草稿 → 直接用
      setTitle(restoredData.title);
      setSummary(restoredData.summary);
      setContent(restoredData.content);
      setTags(restoredData.tags);
      setFetching(false);
      draftApplied.current = true;
    }
  }, [restoredData]);

  // 没有本地草稿 → 从服务端加载
  const serverLoaded = useRef(false);
  useEffect(() => {
    // 如果本地草稿已经应用过了，跳过服务端加载
    if (draftApplied.current) return;
    if (serverLoaded.current) return;
    if (!slug) return;

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
        setTags(data.post.tags?.map((t: { name: string }) => t.name) ?? []);
        serverLoaded.current = true;
      } catch {
        setError("加载失败");
      } finally {
        setFetching(false);
      }
    }

    loadPost();
  }, [slug, restoredData]); // restoredData 变化后（为 null 即无草稿）再加载

  // 加载已有标签建议
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        if (data?.posts) {
          const allTags = new Set<string>();
          (data.posts as Array<{ tags?: { name: string }[] }>).forEach(
            (p) => p.tags?.forEach((t) => allTags.add(t.name))
          );
          setTagSuggestions(Array.from(allTags));
        }
      })
      .catch(() => {});
  }, []);

  // 内容变化 → 自动存 localStorage（防抖）
  useEffect(() => {
    persist({ title, summary, content, tags });
  }, [title, summary, content, tags, persist]);

  /** 保存草稿 → PUT published=false → 留在当前页 */
  async function handleSave() {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, content, tags, published: false }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      clear(); // ✅ 已保存到服务器，清除本地草稿
      setSuccess("草稿已保存");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("保存失败");
    } finally {
      setSaving(false);
    }
  }

  /** 发布文章 → PUT published=true → 跳转文章页 */
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

    setSaving(true);

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, content, tags, published: true }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      clear(); // ✅ 已发布，清除本地草稿
      router.push(`/blog/${data.slug}`);
    } catch {
      setError("发布失败");
    } finally {
      setSaving(false);
    }
  }

  // SSR 和客户端初始渲染都显示 loading，hydration 一致
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

      {/* ✅ 草稿恢复提示 */}
      {isRestored && (
        <p className={styles.draftHint}>📝 已恢复未保存的内容</p>
      )}

      <EditorForm
        title={title}
        summary={summary}
        content={content}
        tags={tags}
        loading={saving}
        error={error}
        success={success}
        onTitleChange={setTitle}
        onSummaryChange={setSummary}
        onContentChange={setContent}
        onTagsChange={setTags}
        tagSuggestions={tagSuggestions}
        onSave={handleSave}
        onPublish={handlePublish}
      />
    </main>
  );
}
