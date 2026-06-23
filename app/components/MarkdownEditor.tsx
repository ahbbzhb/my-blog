"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import styles from "./MarkdownEditor.module.css";

type Mode = "split" | "edit" | "preview";

type MarkdownEditorProps = {
  content: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Ctrl+S / Cmd+S 回调 */
  onSave?: () => void;
};

export default function MarkdownEditor({
  content,
  onChange,
  disabled = false,
  onSave,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<Mode>("split");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) onChange(text);
    };
    reader.readAsText(file);

    // 重置 input，允许重复上传同一文件
    e.target.value = "";
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
    },
    [onSave],
  );

  return (
    <div className={styles.wrapper}>
      {/* ---------- 工具栏 ---------- */}
      <div className={styles.toolbar}>
        <div className={styles.modes}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "edit" ? styles.active : ""}`}
            onClick={() => setMode("edit")}
            disabled={disabled}
          >
            Edit
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "preview" ? styles.active : ""}`}
            onClick={() => setMode("preview")}
            disabled={disabled}
          >
            Preview
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "split" ? styles.active : ""}`}
            onClick={() => setMode("split")}
            disabled={disabled}
          >
            Split
          </button>
        </div>

        <button
          type="button"
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="上传 .md 或 .txt 文件"
        >
          📎 上传文件
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.txt"
          className={styles.fileInput}
          onChange={handleFileSelect}
        />
      </div>

      {/* ---------- 编辑 / 预览区 ---------- */}
      <div
        className={`${styles.panes} ${
          mode === "split" ? styles.split : styles.full
        }`}
      >
        {/* 编辑面板：edit / split 模式下显示 */}
        {mode !== "preview" && (
          <div className={styles.pane}>
            <textarea
              className={styles.textarea}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="在此编写 Markdown 正文..."
            />
          </div>
        )}

        {/* 预览面板：preview / split 模式下显示 */}
        {mode !== "edit" && (
          <div className={styles.pane}>
            <div className={styles.preview}>
              {content.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className={styles.previewEmpty}>暂无内容</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------- 底部状态栏 ---------- */}
      <div className={styles.statusBar}>
        <span className={styles.charCount}>
          {content.length.toLocaleString()} 字符
        </span>
        {onSave && (
          <span className={styles.saveHint}>Ctrl+S 保存</span>
        )}
      </div>
    </div>
  );
}
