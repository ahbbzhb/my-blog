import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import { getPostBySlug, getCommentsByPostId, getPostLikeInfo } from "../../lib/data";
import CommentSection from "../../components/CommentSection";
import LikeButton from "../../components/LikeButton";
import styles from "./page.module.css";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, session] = await Promise.all([
    getPostBySlug(decodeURIComponent(slug)),
    getServerSession(authOptions),
  ]);

  const comments = post ? await getCommentsByPostId(post.id) : [];
  const userId = (session?.user as any)?.id as string | undefined;
  const likeInfo = post
    ? await getPostLikeInfo(post.id, userId)
    : { count: 0, userLiked: false };

  // 是否为作者
  const isAuthor =
    session?.user?.email && post?.author.id
      ? (session.user as any).id === post.author.id
      : false;

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

            {isAuthor && (
              <Link href={`/editor/${post.slug}`} className={styles.editBtn}>
                编辑
              </Link>
            )}
          </div>
        </header>

        <hr className={styles.divider} />

        {/* 文章正文 */}
        <div className={styles.content}>{post.content}</div>
      </article>

      {/* 文章点赞 */}
      <div className={styles.interactions}>
        <LikeButton
          postId={post.id}
          initialLiked={likeInfo.userLiked}
          initialCount={likeInfo.count}
        />
      </div>

      <CommentSection postId={post.id} initialComments={comments} />
    </main>
  );
}
