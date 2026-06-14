import styles from "./EditorForm.module.css";

type EditorFormProps = {
  title: string;
  summary: string;
  content: string;

  loading: boolean;
  error: string;

  submitText: string;

  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onContentChange: (value: string) => void;

  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
};

export default function EditorForm({
  title,
  summary,
  content,
  loading,
  error,
  submitText,
  onTitleChange,
  onSummaryChange,
  onContentChange,
  onSubmit,
  onDelete,
}: EditorFormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error && <p className={styles.error}>{error}</p>}

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
        <textarea
          className={styles.editor}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.submitBtn} type="submit" disabled={loading}>
          {loading ? "处理中..." : submitText}
        </button>

        {onDelete && (
          <button
            className={styles.deleteBtn}
            type="button"
            onClick={onDelete}
            disabled={loading}
          >
            删除文章
          </button>
        )}
      </div>
    </form>
  );
}
