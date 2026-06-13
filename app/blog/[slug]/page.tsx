import Link from "next/link";
import { getPostBySlug } from "../../lib/data";
import styles from "./page.module.css";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // 文章不存在
  if (!post) {
    return (
      <main className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>文章不存在</h1>
        <Link href="/" className={styles.notFoundLink}>
          返回首页
        </Link>
      </main>
    );
  }

  return (
    <main>
      <article className={styles.article}>
        {/* 返回首页 */}
        <Link href="/" className={styles.backLink}>
          ← 返回首页
        </Link>

        {/* 文章头部：标题 + 元信息 */}
        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.meta}>
            <Link
              href={`/u/${post.author.username}`}
              className={styles.author}
            >
              {post.author.username}
            </Link>
            <time dateTime={post.createdAt.toISOString()}>
              {post.createdAt.toLocaleDateString("zh-CN")}
            </time>
            <span>{post.views} 次阅读</span>
          </div>
        </header>

        <hr className={styles.divider} />

        {/* 文章正文 */}
        <div className={styles.content}>{post.content}</div>
      </article>
    </main>
  );
}
