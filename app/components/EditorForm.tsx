"use client";

import { useRef, useEffect, useState } from "react";
import MarkdownEditor from "./MarkdownEditor";
import TagInput from "./TagInput";
import { generateSummary, generateTitle } from "../lib/api/ai";
import styles from "./EditorForm.module.css";

type EditorFormProps = {
  title: string;
  summary: string;
  content: string;
  tags: string[];

  loading: boolean;
  error: string;
  success?: string;

  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;

  /** 已有标签建议（autocomplete） */
  tagSuggestions?: string[];

  /** 保存草稿 */
  onSave: () => void;
  /** 发布文章 */
  onPublish: () => void;
};

export default function EditorForm({
  title,
  summary,
  content,
  tags,
  loading,
  error,
  success,
  onTitleChange,
  onSummaryChange,
  onContentChange,
  onTagsChange,
  tagSuggestions,
  onSave,
  onPublish,
}: EditorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [aiLoading, setAiLoading] = useState<"title" | "summary" | null>(null);
  const [aiError, setAiError] = useState("");

  // AI 生成标题
  async function handleAITitle() {
    if (!content.trim()) return;
    setAiLoading("title");
    setAiError("");
    try {
      const result = await generateTitle(content);
      onTitleChange(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI 标题生成失败";
      setAiError(msg);
    } finally {
      setAiLoading(null);
    }
  }

  // AI 生成摘要
  async function handleAISummarize() {
    if (!content.trim()) return;
    setAiLoading("summary");
    setAiError("");
    try {
      const result = await generateSummary(content);
      onSummaryChange(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI 摘要生成失败";
      setAiError(msg);
    } finally {
      setAiLoading(null);
    }
  }

  // Ctrl+S / Cmd+S → 保存草稿
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!loading) onSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, onSave]);

  return (
    <form ref={formRef} className={styles.form} onSubmit={(e) => e.preventDefault()}>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          <label>标题</label>
          <button
            className={styles.aiBtn}
            type="button"
            onClick={handleAITitle}
            disabled={loading || aiLoading !== null || !content.trim()}
            title="使用 AI 根据正文生成标题"
          >
            {aiLoading === "title" ? "生成中..." : "AI 生成"}
          </button>
        </div>
        {aiError && <p className={styles.aiError}>{aiError}</p>}
        <input
          className={styles.input}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          <label>摘要</label>
          <button
            className={styles.aiBtn}
            type="button"
            onClick={handleAISummarize}
            disabled={loading || aiLoading !== null || !content.trim()}
            title="使用 AI 根据正文生成摘要"
          >
            {aiLoading === "summary" ? "生成中..." : "AI 生成"}
          </button>
        </div>
        <textarea
          className={styles.textarea}
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label>标签</label>
        <TagInput
          tags={tags}
          onChange={onTagsChange}
          suggestions={tagSuggestions}
          disabled={loading}
          placeholder="输入标签，回车添加"
        />
      </div>

      <div className={styles.field}>
        <label>正文</label>
        <MarkdownEditor
          content={content}
          onChange={onContentChange}
          disabled={loading}
          onSave={onSave}
        />
      </div>

      <div className={styles.actions}>
        <button
          className={styles.saveBtn}
          type="button"
          onClick={onSave}
          disabled={loading}
        >
          {loading ? "处理中..." : "保存草稿"}
        </button>

        <button
          className={styles.publishBtn}
          type="button"
          onClick={onPublish}
          disabled={loading}
        >
          {loading ? "处理中..." : "发布文章"}
        </button>
      </div>
    </form>
  );
}
