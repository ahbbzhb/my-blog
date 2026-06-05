import { getPosts } from "@/app/lib/data";
import PostCard from "@/app/components/PostCard";

export default function HomePage() {
  const posts = getPosts();

  return (
    <>
      {/* ===== Hero 区域 ===== */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Welcome to BlogHub</h1>
          <p className="hero-subtitle">
            一个简洁的写作平台，分享你的想法，发现有趣的内容
          </p>
        </div>
      </section>

      {/* ===== 文章列表 ===== */}
      <section className="post-list">
        <h2 className="post-list-heading">最新文章</h2>

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </>
  );
}
