"use client";

import { useRef, useEffect } from "react";
import MarkdownEditor from "./MarkdownEditor";
import styles from "./EditorForm.module.css";

type EditorFormProps = {
  title: string;
  summary: string;
  content: string;

  loading: boolean;
  error: string;
  success?: string;

  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onContentChange: (value: string) => void;

  /** 保存草稿 */
  onSave: () => void;
  /** 发布文章 */
  onPublish: () => void;
};

export default function EditorForm({
  title,
  summary,
  content,
  loading,
  error,
  success,
  onTitleChange,
  onSummaryChange,
  onContentChange,
  onSave,
  onPublish,
}: EditorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

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
        <label>标题</label>
        <input
          className={styles.input}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label>摘要</label>
        <textarea
          className={styles.textarea}
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          disabled={loading}
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
