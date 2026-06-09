import Link from "next/link";
import { getUserByUsername, getPostsByUsername } from "../../lib/data";
import PostCard from "../../components/PostCard";
import styles from "./page.module.css";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = getUserByUsername(username);

  // 用户不存在
  if (!user) {
    return (
      <main className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>用户不存在</h1>
        <p>你查找的用户 @{username} 还没有加入我们。</p>
        <Link href="/" className={styles.notFoundLink}>
          ← 回到首页
        </Link>
      </main>
    );
  }

  const posts = getPostsByUsername(username);

  // 头像首字母
  const avatarLetter = user.username.charAt(0).toUpperCase();

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.backLink}>
        ← 回到首页
      </Link>

      {/* 用户信息卡片 */}
      <section className={styles.profile}>
        <div className={styles.avatar}>{avatarLetter}</div>

        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{user.username}</h1>

          {user.bio && <p className={styles.bio}>{user.bio}</p>}

          <p className={styles.joinDate}>
            加入时间：{user.createdAt.toLocaleDateString()}
          </p>
        </div>
      </section>

      <hr className={styles.divider} />

      <h2 className={styles.sectionTitle}>他的博客</h2>

      <section className={styles.postList}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <p className={styles.emptyHint}>暂无文章</p>
        )}
      </section>
    </main>
  );
}
