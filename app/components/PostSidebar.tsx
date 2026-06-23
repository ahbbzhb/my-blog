"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./PostSidebar.module.css";

type PostItem = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
};

type PostSidebarProps = {
  /** 当前正在编辑的文章 slug，用于高亮 */
  currentSlug?: string;

  /**
   * full  — 编辑器用：显示全部文章（含草稿），带状态圆点，高亮当前
   * compact — 用户主页用：只显示已发布文章，带"写文章"按钮
   */
  variant?: "full" | "compact";

  /** 预取的文章列表（compact 模式由服务端直传，避免客户端 fetch） */
  posts?: PostItem[];

  /** compact 模式下是否显示"写文章"按钮（仅本人主页） */
  isOwner?: boolean;

  /** 变化时重新拉取列表（编辑器 layout 用 pathname 驱动） */
  refreshKey?: string;
};

export default function PostSidebar({
  currentSlug,
  variant = "full",
  posts: prefetchedPosts,
  isOwner = false,
  refreshKey,
}: PostSidebarProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>(prefetchedPosts ?? []);
  const [loading, setLoading] = useState(!prefetchedPosts);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    // compact 模式有预取数据，不需要 fetch
    if (prefetchedPosts) return;

    async function fetchPosts() {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();

        if (!data.success) {
          setError(data.message || "加载失败");
          return;
        }

        setPosts(data.posts);
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [prefetchedPosts, refreshKey]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  async function handlePublish(e: React.MouseEvent, slug: string) {
    e.stopPropagation();
    setPublishing(slug);

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: true }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "发布失败");
        return;
      }

      // 更新本地状态：草稿 → 已发布
      setPosts((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, published: true } : p)),
      );
    } catch {
      alert("网络错误");
    } finally {
      setPublishing(null);
    }
  }

  async function handleDelete(e: React.MouseEvent, slug: string, title: string) {
    e.stopPropagation();

    if (!confirm(`确定要删除「${title}」吗？此操作不可撤销。`)) return;

    setDeleting(slug);

    try {
      const res = await fetch(`/api/posts/${slug}`, { method: "DELETE" });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "删除失败");
        return;
      }

      // 从列表中移除
      setPosts((prev) => prev.filter((p) => p.slug !== slug));

      // 如果删除的是当前正在编辑的文章，跳转到编辑器首页
      if (slug === currentSlug) {
        router.push("/editor");
      }
    } catch {
      alert("网络错误");
    } finally {
      setDeleting(null);
    }
  }

  const isCompact = variant === "compact";
  // compact 模式下仅本人可删除
  const showDelete = variant === "full" || isOwner;

  return (
    <aside className={`${styles.sidebar} ${isCompact ? styles.compact : ""}`}>
      {/* 顶栏 */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>文章列表</span>
        {isCompact && isOwner && (
          <button
            className={styles.newBtn}
            onClick={() => router.push("/editor")}
          >
            + 写文章
          </button>
        )}
      </div>

      <div className={styles.list}>
        {/* 加载中 */}
        {loading && (
          <div className={styles.empty}>
            <p>加载中...</p>
          </div>
        )}

        {/* 加载失败 */}
        {!loading && error && (
          <div className={styles.empty}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* 空列表 */}
        {!loading && !error && posts.length === 0 && (
          <div className={styles.empty}>
            <p>暂无文章</p>
          </div>
        )}

        {/* 文章列表 */}
        {!loading &&
          posts.map((post) => {
            const isActive = post.slug === currentSlug;
            const isPublishing = publishing === post.slug;
            const isDeleting = deleting === post.slug;

            return (
              <button
                key={post.id}
                className={`${styles.item} ${isActive ? styles.active : ""}`}
                onClick={() => router.push(`/editor/${post.slug}`)}
                disabled={isDeleting || isPublishing}
              >
                <div className={styles.itemTop}>
                  {/* full 模式显示状态圆点 */}
                  {!isCompact && (
                    <span
                      className={styles.statusDot}
                      data-published={post.published}
                    />
                  )}
                  <span className={styles.itemTitle}>{post.title}</span>

                  {/* 草稿可快速发布 */}
                  {!post.published && showDelete && (
                    <span
                      className={styles.publishIcon}
                      onClick={(e) => handlePublish(e, post.slug)}
                      title="发布文章"
                    >
                      {isPublishing ? "..." : "↗"}
                    </span>
                  )}

                  {showDelete && (
                    <span
                      className={styles.deleteIcon}
                      onClick={(e) => handleDelete(e, post.slug, post.title)}
                      title="删除文章"
                    >
                      {isDeleting ? "..." : "×"}
                    </span>
                  )}
                </div>
                <span className={styles.itemDate}>
                  {formatDate(post.updatedAt)}
                </span>
              </button>
            );
          })}
      </div>
    </aside>
  );
}
