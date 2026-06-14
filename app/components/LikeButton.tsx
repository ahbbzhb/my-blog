"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./LikeButton.module.css";

type Props = {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
};

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);

    // 乐观更新
    setLiked(!liked);
    setCount(count + (liked ? -1 : 1));

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();

      if (!data.success) {
        // 回滚
        setLiked(liked);
        setCount(count);
      } else {
        // 以服务器返回为准
        setLiked(data.liked);
      }
    } catch {
      setLiked(liked);
      setCount(count);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={`${styles.btn} ${liked ? styles.liked : ""}`}
      onClick={handleToggle}
      disabled={loading}
      aria-label={liked ? "取消点赞" : "点赞"}
    >
      <span className={styles.icon}>{liked ? "❤️" : "🤍"}</span>
      <span className={styles.count}>{count}</span>
    </button>
  );
}
