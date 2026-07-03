"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import styles from "./CommentSection.module.css";

type Comment = {
  id: number;
  content: string;
  createdAt: string;
  author: {
    username: string;
    avatar?: string | null;
  };
};

type Props = {
  postId: string;
  initialComments: Comment[];
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentSection({
  postId,
  initialComments,
}: Props) {
  const { data: session } = useSession();

  const [content, setContent] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComment() {
    setError("");

    if (!content.trim()) {
      setError("评论不能为空");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      setComments([data.comment, ...comments]);
      setContent("");
    } catch (error) {
      console.error(error);
      setError("评论失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>评论</h2>

      {/* 未登录 */}
      {!session ? (
        <div className={styles.loginPrompt}>
          请
          <Link href="/login" className={styles.loginLink}>
            登录
          </Link>
          后参与评论
        </div>
      ) : (
        <div className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}

          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写点什么..."
            disabled={loading}
          />

          <button
            className={styles.submitBtn}
            onClick={handleComment}
            disabled={loading}
          >
            {loading ? "提交中..." : "发表评论"}
          </button>
        </div>
      )}

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <p className={styles.empty}>暂无评论，来抢个沙发吧</p>
      ) : (
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <img
                  className={styles.commentAvatar}
                  src={comment.author.avatar ?? "/default-avatar.png"}
                  alt={comment.author.username}
                />
                <span className={styles.commentAuthor}>
                  {comment.author.username}
                </span>
                <span className={styles.commentTime} suppressHydrationWarning>
                  {formatTime(comment.createdAt)}
                </span>
              </div>
              <p className={styles.commentContent}>{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
